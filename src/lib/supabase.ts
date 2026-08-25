import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local"
  );
}

// Cliente único do Supabase, reutilizável no browser e no servidor (rotas com runtime "nodejs").
// Usa a publishable key, segura para expor no client — o acesso aos dados é controlado
// por Row Level Security (RLS) nas tabelas do projeto.
export const supabase = createClient(supabaseUrl, supabaseKey);
