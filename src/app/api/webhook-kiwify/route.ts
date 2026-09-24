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

// A documentação da Kiwify não deixa claro em que formato/profundidade os
// campos voltam no corpo do webhook. Em vez de assumir um caminho fixo (ex:
// body.TrackingParameters.s1), procura recursivamente pela primeira chave com
// esse nome (sem diferenciar maiúsculas/minúsculas) em todo o JSON recebido.
function encontrarChave(valor: unknown, nome: string): string | null {
  if (valor == null) return null;
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const achado = encontrarChave(item, nome);
      if (achado) return achado;
    }
    return null;
  }
  if (typeof valor === "object") {
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      if (chave.toLowerCase() === nome && typeof item === "string" && item.trim()) {
        return item.trim();
      }
    }
    for (const item of Object.values(valor as Record<string, unknown>)) {
      const achado = encontrarChave(item, nome);
      if (achado) return achado;
    }
  }
  return null;
}

// Só libera o plano com pagamento aprovado. A Kiwify manda o mesmo webhook
// para outros eventos (Pix/boleto gerado, recusado, reembolso, chargeback),
// e cada um deles marcaria a pessoa como paga se não fosse filtrado aqui.
function pagamentoAprovado(body: unknown): boolean {
  const status = encontrarChave(body, "order_status")?.toLowerCase();
  const evento = encontrarChave(body, "webhook_event_type")?.toLowerCase();
  return status === "paid" || evento === "order_approved";
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

  // Só status e ID do pedido: o payload completo traz nome, e-mail, CPF e
  // telefone do comprador, que não devem ficar gravados nos logs.
  console.log(
    "[webhook-kiwify] Pedido recebido:",
    JSON.stringify({
      order_id: encontrarChave(body, "order_id"),
      order_status: encontrarChave(body, "order_status"),
    }),
  );

  if (!pagamentoAprovado(body)) {
    console.log("[webhook-kiwify] Evento ignorado: pagamento não aprovado.");
    // 200 pra Kiwify não retentar: o evento chegou certo, só não libera nada.
    return NextResponse.json({ ok: true, ignorado: "pagamento não aprovado." });
  }

  const userId = encontrarChave(body, "s1");
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
