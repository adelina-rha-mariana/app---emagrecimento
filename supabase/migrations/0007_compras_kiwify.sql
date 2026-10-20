-- Integração Kiwify: registra cada compra, libera o plano pelo e-mail da
-- compra (só com e-mail confirmado) ou pelo s1 (a sessão que abriu o
-- checkout), e retira o acesso em reembolso/chargeback.
--
-- O "plano liberado" continua sendo app_metadata.pago = true em auth.users
-- (só o servidor consegue gravar app_metadata). Toda a lógica fica aqui no
-- banco, em funções que só a service_role pode chamar, pra ser atômica e não
-- depender de qual tela do app a pessoa usou pra se cadastrar.

-- ---------------------------------------------------------------------------
-- compras_kiwify: uma linha por pedido da Kiwify.
-- ---------------------------------------------------------------------------
create table if not exists public.compras_kiwify (
  order_id text primary key,
  -- Sempre em minúsculas, pra comparar com auth.users.email.
  email text,
  status text not null check (status in ('pago', 'reembolsado', 'chargeback')),
  -- Conta que abriu o checkout (parâmetro s1). Pode ser uma sessão anônima,
  -- que ainda não tem e-mail — por isso é guardada separado do e-mail.
  user_id_s1 uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compras_kiwify is
  'Pedidos recebidos pelo webhook da Kiwify. Quem tem compra com status pago (pelo e-mail confirmado ou pelo s1) fica com app_metadata.pago = true.';

create index if not exists compras_kiwify_email_idx on public.compras_kiwify (email);
create index if not exists compras_kiwify_user_id_s1_idx on public.compras_kiwify (user_id_s1);

-- RLS ligado e nenhuma policy: ninguém pelo navegador lê ou grava aqui, só a
-- service_role (webhook) e as funções abaixo.
alter table public.compras_kiwify enable row level security;

-- ---------------------------------------------------------------------------
-- webhook_kiwify_eventos: registro de cada aviso recebido, pra conferência.
-- Guarda só o necessário: nada de CPF, telefone ou endereço.
-- ---------------------------------------------------------------------------
create table if not exists public.webhook_kiwify_eventos (
  id bigint generated always as identity primary key,
  recebido_em timestamptz not null default now(),
  assinatura_ok boolean not null,
  order_id text,
  evento text,
  order_status text,
  email text,
  resultado text not null
);

comment on table public.webhook_kiwify_eventos is
  'Log de todos os avisos do webhook da Kiwify (inclusive recusados por assinatura inválida) e do que o app fez com cada um.';

create index if not exists webhook_kiwify_eventos_order_id_idx on public.webhook_kiwify_eventos (order_id);

alter table public.webhook_kiwify_eventos enable row level security;

-- ---------------------------------------------------------------------------
-- A pessoa tem alguma compra paga? Vale pelo s1 ou pelo e-mail — este último
-- só se o e-mail da conta estiver confirmado, senão bastaria alguém criar
-- conta com o e-mail de outro comprador pra pegar o acesso dele.
-- ---------------------------------------------------------------------------
create or replace function public.kiwify_tem_compra_ativa(
  p_user_id uuid,
  p_email text,
  p_email_confirmado boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.compras_kiwify c
     where c.status = 'pago'
       and (
         c.user_id_s1 = p_user_id
         or (p_email_confirmado and p_email is not null and c.email = lower(p_email))
       )
  );
$$;

-- ---------------------------------------------------------------------------
-- Trigger em auth.users: sempre que a conta é criada ou alterada (inclusive
-- quando o e-mail é confirmado pelo código), se ela tiver compra paga,
-- garante pago = true no app_metadata.
--
-- É BEFORE e roda em todo UPDATE (não só quando o e-mail muda) de propósito:
-- o próprio Supabase Auth regrava o app_metadata em alguns fluxos (ex: ao
-- transformar a sessão anônima em conta com e-mail), e isso apagaria um
-- pago = true gravado antes. Aqui o pago é reaplicado a cada gravação.
--
-- Nunca coloca pago = false: quem já tinha acesso por outro motivo não perde.
-- Retirar o acesso é feito só por kiwify_processar_evento (reembolso).
-- ---------------------------------------------------------------------------
create or replace function public.kiwify_aplicar_pago_na_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if public.kiwify_tem_compra_ativa(new.id, new.email, new.email_confirmed_at is not null) then
      new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"pago": true}'::jsonb;
    end if;
  exception when others then
    -- Um erro aqui não pode impedir login/cadastro de ninguém.
    raise warning 'kiwify_aplicar_pago_na_conta: %', sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists kiwify_aplicar_pago_na_conta on auth.users;
create trigger kiwify_aplicar_pago_na_conta
  before insert or update on auth.users
  for each row execute function public.kiwify_aplicar_pago_na_conta();

-- ---------------------------------------------------------------------------
-- Processa um aviso da Kiwify já com a assinatura conferida.
-- p_evento: 'aprovado' | 'reembolsado' | 'chargeback'.
-- Devolve um texto curto com o que foi feito (vai pro log de eventos).
-- ---------------------------------------------------------------------------
create or replace function public.kiwify_processar_evento(
  p_order_id text,
  p_evento text,
  p_email text,
  p_s1 text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := nullif(lower(trim(p_email)), '');
  v_compra public.compras_kiwify;
  v_user_s1 uuid;
  v_contas integer;
  v_usuario record;
begin
  if p_order_id is null or p_order_id = '' then
    raise exception 'order_id vazio';
  end if;
  if p_evento not in ('aprovado', 'reembolsado', 'chargeback') then
    raise exception 'evento inválido: %', p_evento;
  end if;

  -- Avisos do mesmo pedido chegando ao mesmo tempo (a Kiwify reenvia) são
  -- processados um de cada vez.
  perform pg_advisory_xact_lock(hashtext('kiwify:' || p_order_id));

  select * into v_compra from public.compras_kiwify where order_id = p_order_id;

  if p_evento = 'aprovado' then
    if found and v_compra.status = 'pago' then
      return 'repetido: compra já registrada';
    end if;
    if found then
      -- Um "aprovado" atrasado depois do reembolso não pode devolver o acesso.
      return 'ignorado: pedido já está ' || v_compra.status;
    end if;

    if p_s1 ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select id into v_user_s1 from auth.users where id = p_s1::uuid;
    end if;

    insert into public.compras_kiwify (order_id, email, status, user_id_s1)
    values (p_order_id, v_email, 'pago', v_user_s1);

    -- Toca nas contas atingidas: o trigger acima aplica o pago = true.
    update auth.users u
       set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
     where u.id = v_user_s1
        or (v_email is not null and lower(u.email) = v_email and u.email_confirmed_at is not null);
    get diagnostics v_contas = row_count;

    if v_contas = 0 then
      return 'compra guardada: nenhuma conta confirmada com esse e-mail ainda';
    end if;
    return 'liberado: ' || v_contas || ' conta(s)';
  end if;

  -- Reembolso ou chargeback.
  if not found then
    -- Cancelamento de um pedido que nunca vimos aprovado: guarda mesmo assim,
    -- pra que um "aprovado" que chegue atrasado seja ignorado.
    insert into public.compras_kiwify (order_id, email, status)
    values (p_order_id, v_email, p_evento);
    return 'registrado: ' || p_evento || ' sem compra aprovada antes';
  end if;

  if v_compra.status = p_evento then
    return 'repetido: pedido já estava ' || p_evento;
  end if;

  update public.compras_kiwify
     set status = p_evento, updated_at = now()
   where order_id = p_order_id;

  v_contas := 0;
  for v_usuario in
    select u.id, u.email, u.email_confirmed_at
      from auth.users u
     where u.id = v_compra.user_id_s1
        or (v_compra.email is not null and lower(u.email) = v_compra.email)
  loop
    -- Quem tem outra compra paga continua com acesso.
    if not public.kiwify_tem_compra_ativa(v_usuario.id, v_usuario.email, v_usuario.email_confirmed_at is not null) then
      update auth.users
         set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"pago": false}'::jsonb
       where id = v_usuario.id;
      v_contas := v_contas + 1;
    end if;
  end loop;

  return 'acesso retirado (' || p_evento || '): ' || v_contas || ' conta(s)';
end;
$$;

-- Funções security definer em public ficam executáveis por anon/authenticated
-- por padrão no Supabase. Só o servidor (service_role) pode chamar estas.
revoke all on function public.kiwify_tem_compra_ativa(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.kiwify_processar_evento(text, text, text, text) from public, anon, authenticated;
revoke all on function public.kiwify_aplicar_pago_na_conta() from public, anon, authenticated;
grant execute on function public.kiwify_processar_evento(text, text, text, text) to service_role;
