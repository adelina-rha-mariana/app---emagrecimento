-- As foreign keys pra auth.users(id) foram criadas sem "on delete cascade"
-- (migration 0004). Isso significa que apagar um usuário pelo painel do
-- Supabase (Authentication > Users > Delete) falha com erro de chave
-- estrangeira sempre que ele tiver plano, registro vital, resposta de
-- questionário ou avaliação de dia 7 salvos — é preciso apagar essas linhas
-- manualmente antes. Recria as constraints com "on delete cascade" pra que
-- apagar o usuário já limpe os dados dele automaticamente.

alter table public.respostas_questionario
  drop constraint if exists respostas_questionario_user_id_fkey,
  add constraint respostas_questionario_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.planos
  drop constraint if exists planos_user_id_fkey,
  add constraint planos_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.registros_vitais
  drop constraint if exists registros_vitais_user_id_fkey,
  add constraint registros_vitais_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.avaliacoes_dia7
  drop constraint if exists avaliacoes_dia7_user_id_fkey,
  add constraint avaliacoes_dia7_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
