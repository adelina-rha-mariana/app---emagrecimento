-- A tela de abertura do app trocou a lista de exames/condições médicas por
-- um checklist leve de rotina (sono, alimentação, movimento, estresse).
-- A coluna condicoes_saude (0001) deixa de ser usada por essa tela, mas
-- fica no banco sem alteração (não é destrutivo). Novas respostas passam
-- a preencher sinais_rotina.
alter table public.respostas_questionario
  add column if not exists sinais_rotina text[];

comment on column public.respostas_questionario.sinais_rotina is
  'Sinais leves de rotina marcados na tela inicial (sono, alimentação, movimento, estresse). Substitui condicoes_saude, que fica preservada por compatibilidade mas não é mais preenchida.';
