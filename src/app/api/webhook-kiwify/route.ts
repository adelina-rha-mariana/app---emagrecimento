import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET;

// Cliente com a service_role key: só existe no servidor, ignora RLS, e é o
// único jeito de marcar outro usuário como pago sem que ele esteja logado ali
// (auth.admin.updateUserById exige esse nível de acesso).
function supabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase (service role) não configurado no servidor.");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// A documentação da Kiwify não deixa claro em que formato/profundidade o
// parâmetro de rastreamento "s1" volta no corpo do webhook. Em vez de assumir
// um caminho fixo (ex: body.TrackingParameters.s1), procura recursivamente
// por qualquer chave chamada "s1" (sem diferenciar maiúsculas/minúsculas) em
// todo o JSON recebido.
function encontrarS1(valor: unknown): string | null {
  if (valor == null) return null;
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const achado = encontrarS1(item);
      if (achado) return achado;
    }
    return null;
  }
  if (typeof valor === "object") {
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      if (chave.toLowerCase() === "s1" && typeof item === "string" && item.trim()) {
        return item.trim();
      }
    }
    for (const item of Object.values(valor as Record<string, unknown>)) {
      const achado = encontrarS1(item);
      if (achado) return achado;
    }
  }
  return null;
}

export async function POST(request: Request) {
  // Autenticação do webhook: em vez de depender de um mecanismo de assinatura
  // da Kiwify que a documentação não especifica com clareza, o segredo vai
  // direto na URL cadastrada no painel da Kiwify (?secret=...). A Kiwify
  // sempre faz POST pra URL exata configurada, então isso funciona
  // independente de como ela mande (ou não) um token próprio.
  const url = new URL(request.url);
  const secretRecebido = url.searchParams.get("secret");

  if (!webhookSecret || secretRecebido !== webhookSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  // Log completo pra debug da primeira compra real — a Kiwify não documenta
  // o formato exato do payload, então isso é o que vamos olhar pra ajustar
  // a extração do s1 se necessário.
  console.log("[webhook-kiwify] Payload recebido:", JSON.stringify(body));

  const userId = encontrarS1(body);
  if (!userId) {
    console.error("[webhook-kiwify] Não encontrei o parâmetro s1 (user_id) no payload.");
    // Responde 200 mesmo assim pra Kiwify não ficar retentando indefinidamente
    // por um problema que reenviar não resolve — mas fica registrado no log.
    return NextResponse.json({ ok: false, aviso: "s1 não encontrado no payload." });
  }

  let admin;
  try {
    admin = supabaseAdmin();
  } catch (err) {
    console.error("[webhook-kiwify]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Supabase (service role) não configurado no servidor." }, { status: 500 });
  }

  // app_metadata (não user_metadata!) só pode ser alterado via Admin API, com
  // a service_role key — o usuário não consegue editar isso sozinho pelo
  // navegador. Guardar "pago" em user_metadata seria uma brecha: qualquer
  // pessoa logada poderia rodar supabase.auth.updateUser({ data: { pago: true } })
  // no console e destravar o plano sem pagar.
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { pago: true },
  });

  if (error) {
    console.error("[webhook-kiwify] Falha ao marcar usuário como pago:", userId, error.message);
    return NextResponse.json({ error: "Falha ao atualizar o usuário." }, { status: 500 });
  }

  console.log("[webhook-kiwify] Usuário marcado como pago:", userId);
  return NextResponse.json({ ok: true });
}
