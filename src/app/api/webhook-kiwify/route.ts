import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Token que aparece no painel da Kiwify ao criar o webhook (Apps > Webhooks).
const kiwifyToken = process.env.KIWIFY_WEBHOOK_TOKEN;

// Cliente com a service_role key: só existe no servidor e é o único que pode
// chamar kiwify_processar_evento e gravar nas tabelas da Kiwify (ver
// supabase/migrations/0007_compras_kiwify.sql).
function supabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase (service role) não configurado no servidor.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// A documentação da Kiwify não deixa claro em que formato/profundidade os
// campos voltam no corpo do webhook. Em vez de assumir um caminho fixo (ex:
// body.TrackingParameters.s1), procura recursivamente pela primeira chave com
// esse nome (sem diferenciar maiúsculas/minúsculas) em todo o JSON recebido.
function encontrarValor(valor: unknown, nome: string, aceita: (v: unknown) => boolean): unknown {
  if (valor == null) return null;
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const achado = encontrarValor(item, nome, aceita);
      if (achado != null) return achado;
    }
    return null;
  }
  if (typeof valor === "object") {
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      if (chave.toLowerCase() === nome && aceita(item)) return item;
    }
    for (const item of Object.values(valor as Record<string, unknown>)) {
      const achado = encontrarValor(item, nome, aceita);
      if (achado != null) return achado;
    }
  }
  return null;
}

function encontrarChave(valor: unknown, nome: string): string | null {
  const achado = encontrarValor(valor, nome, (v) => typeof v === "string" && v.trim() !== "");
  return typeof achado === "string" ? achado.trim() : null;
}

// O e-mail do comprador fica dentro de "Customer". Procurar "email" no corpo
// inteiro poderia pegar o e-mail do produtor ou de um afiliado.
function emailDoComprador(body: unknown): string | null {
  const cliente = encontrarValor(body, "customer", (v) => typeof v === "object" && v !== null);
  return cliente ? encontrarChave(cliente, "email") : null;
}

// A Kiwify assina cada aviso: manda ?signature= com o HMAC-SHA1 (hex) do
// corpo, usando o token do webhook como chave. Confere contra o corpo cru e
// contra o JSON re-serializado, porque o cálculo do lado deles pode ter sido
// feito sobre qualquer um dos dois — os dois exigem conhecer o token.
function assinaturaValida(corpoCru: string, assinatura: string | null, token: string): boolean {
  if (!assinatura) return false;
  const recebida = Buffer.from(assinatura.trim().toLowerCase(), "utf8");

  const candidatos = [corpoCru];
  try {
    candidatos.push(JSON.stringify(JSON.parse(corpoCru)));
  } catch {
    // Corpo não é JSON: só o cru vale.
  }

  return candidatos.some((texto) => {
    const esperada = Buffer.from(createHmac("sha1", token).update(texto).digest("hex"), "utf8");
    return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
  });
}

type Evento = "aprovado" | "reembolsado" | "chargeback";

// Só esses três mudam o acesso. Pix/boleto gerado, compra recusada, carrinho
// abandonado etc. ficam registrados no log e são ignorados.
function classificarEvento(tipo: string | null, status: string | null): Evento | null {
  const t = tipo?.toLowerCase();
  const s = status?.toLowerCase();
  if (t === "order_refunded" || s === "refunded") return "reembolsado";
  if (t === "chargeback" || s === "chargedback") return "chargeback";
  if (t === "order_approved" || s === "paid") return "aprovado";
  return null;
}

type Registro = {
  assinatura_ok: boolean;
  order_id?: string | null;
  evento?: string | null;
  order_status?: string | null;
  email?: string | null;
  resultado: string;
};

// Grava o aviso em webhook_kiwify_eventos. Uma falha aqui não pode mudar a
// resposta pra Kiwify (o processamento em si já aconteceu ou não).
async function registrar(admin: SupabaseClient | null, registro: Registro) {
  // No log da Vercel vai só o pedido e o resultado — nada de e-mail ou CPF.
  console.log("[webhook-kiwify]", JSON.stringify({ order_id: registro.order_id ?? null, resultado: registro.resultado }));
  if (!admin) return;
  const { error } = await admin.from("webhook_kiwify_eventos").insert(registro);
  if (error) console.error("[webhook-kiwify] Falha ao gravar o log do evento:", error.message);
}

export async function POST(request: Request) {
  let admin: SupabaseClient | null = null;
  try {
    admin = supabaseAdmin();
  } catch (err) {
    console.error("[webhook-kiwify]", err instanceof Error ? err.message : err);
  }

  if (!kiwifyToken || !admin) {
    console.error("[webhook-kiwify] KIWIFY_WEBHOOK_TOKEN ou Supabase (service role) faltando nas variáveis de ambiente.");
    // 500 faz a Kiwify tentar de novo depois — dá tempo de corrigir a configuração.
    return NextResponse.json({ error: "Webhook não configurado no servidor." }, { status: 500 });
  }

  const corpoCru = await request.text();
  const assinatura = new URL(request.url).searchParams.get("signature");

  if (!assinaturaValida(corpoCru, assinatura, kiwifyToken)) {
    // Nada do corpo é gravado: sem assinatura válida, não dá pra confiar nele.
    await registrar(admin, {
      assinatura_ok: false,
      resultado: assinatura ? "recusado: assinatura não confere" : "recusado: sem assinatura",
    });
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(corpoCru);
  } catch {
    await registrar(admin, { assinatura_ok: true, resultado: "recusado: corpo não é JSON" });
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const orderId = encontrarChave(body, "order_id");
  const tipo = encontrarChave(body, "webhook_event_type");
  const status = encontrarChave(body, "order_status");
  const email = emailDoComprador(body);
  const s1 = encontrarChave(body, "s1");
  const base = { assinatura_ok: true, order_id: orderId, evento: tipo, order_status: status, email };

  const evento = classificarEvento(tipo, status);
  if (!evento) {
    await registrar(admin, { ...base, resultado: "ignorado: evento não muda o acesso" });
    // 200 pra Kiwify não retentar: o evento chegou certo, só não muda nada.
    return NextResponse.json({ ok: true, ignorado: true });
  }

  if (!orderId) {
    await registrar(admin, { ...base, resultado: "erro: aviso sem order_id" });
    // Reenviar o mesmo aviso não resolve, então 200 — fica no log pra conferência.
    return NextResponse.json({ ok: false, aviso: "order_id não encontrado no payload." });
  }

  const { data: resultado, error } = await admin.rpc("kiwify_processar_evento", {
    p_order_id: orderId,
    p_evento: evento,
    p_email: email,
    p_s1: s1,
  });

  if (error) {
    await registrar(admin, { ...base, resultado: `erro: ${error.message}` });
    // 500 pra Kiwify tentar de novo: pode ser falha passageira do banco.
    return NextResponse.json({ error: "Falha ao processar o pedido." }, { status: 500 });
  }

  await registrar(admin, { ...base, resultado: String(resultado) });
  return NextResponse.json({ ok: true, resultado });
}
