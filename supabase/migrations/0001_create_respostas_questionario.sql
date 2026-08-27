-- Tabela para armazenar as respostas do questionário (as 3 perguntas abertas)
-- e o contexto numérico/diagnóstico coletado antes delas.
create table if not exists public.respostas_questionario (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Diagnóstico (steps 1-4 do app)
  altura_cm integer,
  peso_atual_kg numeric,
  peso_meta_kg numeric,
  condicoes_saude text[],

  -- Perguntas abertas (steps 5-7 do app)
  q1_o_que_pesa text not null,
  q2_o_que_tentou text not null,
  q3_impacto_dia_a_dia text not null
);

comment on table public.respostas_questionario is
  'Respostas do questionário de diagnóstico + as 3 perguntas abertas do app.';

-- RLS: a chave usada pelo app é a publishable key (papel "anon"), exposta ao navegador.
-- Habilitamos RLS e permitimos apenas INSERT anônimo (o app grava, mas ninguém
-- consegue ler as respostas de volta pela mesma chave pública).
alter table public.respostas_questionario enable row level security;

create policy "permitir insercao anonima"
  on public.respostas_questionario
  for insert
  to anon
  with check (true);
