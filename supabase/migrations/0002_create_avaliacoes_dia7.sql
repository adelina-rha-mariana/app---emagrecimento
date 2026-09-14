-- Tabela para armazenar a avaliação da tela de Dia 7 (TelaAvaliacaoDia7.jsx):
-- uma nota de 0 a 10 (estilo NPS) e um comentário opcional.
create table if not exists public.avaliacoes_dia7 (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  nota integer not null check (nota >= 0 and nota <= 10),
  comentario text
);

comment on table public.avaliacoes_dia7 is
  'Avaliação (nota 0-10 + comentário opcional) da tela de Dia 7 do app.';

-- RLS: mesmo padrão de respostas_questionario — a chave usada pelo app é a
-- publishable key (papel "anon"), então só liberamos INSERT anônimo.
alter table public.avaliacoes_dia7 enable row level security;

create policy "permitir insercao anonima"
  on public.avaliacoes_dia7
  for insert
  to anon
  with check (true);
