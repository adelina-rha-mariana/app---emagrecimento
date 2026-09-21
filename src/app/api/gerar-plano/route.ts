import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Answers = { q1: string; q2: string; q3: string };

type DadosIniciais = {
  altura_cm?: number;
  peso_atual_kg?: number;
  peso_meta_kg?: number;
  sinais_rotina?: string[];
  tentativa_anterior?: string;
};

type PlanDay = {
  dia: number;
  titulo: string;
  nutricao: string;
  movimento: string;
  comportamento: string;
  porque: string;
};

type PlanResult = {
  perfil: string;
  acolhimento: string;
  insight_cientifico: string;
  plano: PlanDay[];
  gerado_em: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Cliente por requisição, autenticado como o usuário que chamou a rota (via o
// access token da sessão dele) — é isso que faz `auth.uid()` resolver certo
// dentro das policies de RLS de respostas_questionario e planos.
function supabaseComoUsuario(accessToken: string) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase não configurado no servidor.");
  }
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente do servidor

function buildPrompt(answers: Answers, tentativaAnterior?: string): string {
  const linhaTentativa = tentativaAnterior
    ? `\nSobre tentativas anteriores com estratégias alimentares, ela marcou: "${tentativaAnterior}".\n`
    : "";
  return `Você é um assistente de acolhimento e bem-estar dentro de um app de hábitos alimentares e comportamento (NÃO é terapia nem substitui acompanhamento médico).

Uma pessoa respondeu três perguntas abertas sobre a relação dela com comida, corpo e peso:
${linhaTentativa}
1) O que mais pesa: ${answers.q1}
2) O que já tentou e não funcionou: ${answers.q2}
3) Como isso afeta o dia a dia dela: ${answers.q3}

Sua tarefa:
1. Identifique um "perfil" curto e humano que resuma o padrão dela (ex: quem come por ansiedade à noite e se culpa depois), com base no que ela escreveu e, se houver, no que ela marcou sobre tentativas anteriores.
2. Escreva um "acolhimento": um parágrafo curto (3-4 frases), tom caloroso e direto, mostrando que você entendeu especificamente o caso dela. Refira-se a algo concreto que ela disse, sem usar aspas. NÃO use a segunda pessoa para afirmar que ela "sofre de" uma condição de saúde; fale sobre o padrão de comportamento, não como se fosse uma avaliação médica.
3. Escreva um "insight científico": 1-2 frases explicando, em linguagem simples, um princípio real de ciência do comportamento alimentar, hormônios (insulina, cortisol, leptina, grelina, tireoide) ou psicologia relevante ao caso dela.
4. Monte um plano de 5 dias de ação, ESPECÍFICO para o padrão dela. Cada dia deve ter: um título curto, uma tarefa em NUTRIÇÃO, uma em MOVIMENTO/EXERCÍCIO e uma em COMPORTAMENTO (sono/estresse), cada uma com um "porquê" ligado a um mecanismo hormonal ou comportamental real.

Regras importantes:
- Não prometa perda de peso específica nem prazo de resultado.
- Não faça alegações médicas nem substitua acompanhamento profissional (nutricionista, psicólogo, médico).
- Tom acolhedor, sem julgamento, sem clichê motivacional vazio.
- NUNCA use o caractere de aspas duplas (") em nenhum texto.
- NUNCA use travessão (—) em nenhum texto; prefira vírgula, ponto, ou reescrever a frase.
- Cada campo deve ser texto corrido em uma única linha.

Responda EXATAMENTE neste formato de marcadores, preenchendo cada um, sem markdown, sem explicações antes ou depois:

@@PERFIL@@
(texto do perfil aqui)
@@ACOLHIMENTO@@
(texto do acolhimento aqui)
@@INSIGHT@@
(texto do insight científico aqui)
@@DIA1_TITULO@@
(título do dia 1)
@@DIA1_NUTRICAO@@
(ação de nutrição do dia 1)
@@DIA1_MOVIMENTO@@
(ação de movimento/exercício do dia 1)
@@DIA1_COMPORTAMENTO@@
(ação de comportamento/sono do dia 1)
@@DIA1_PORQUE@@
(porquê hormonal/comportamental do dia 1)
@@DIA2_TITULO@@
(título do dia 2)
@@DIA2_NUTRICAO@@
(ação de nutrição do dia 2)
@@DIA2_MOVIMENTO@@
(ação de movimento/exercício do dia 2)
@@DIA2_COMPORTAMENTO@@
(ação de comportamento/sono do dia 2)
@@DIA2_PORQUE@@
(porquê do dia 2)
@@DIA3_TITULO@@
(título do dia 3)
@@DIA3_NUTRICAO@@
(ação de nutrição do dia 3)
@@DIA3_MOVIMENTO@@
(ação de movimento/exercício do dia 3)
@@DIA3_COMPORTAMENTO@@
(ação de comportamento/sono do dia 3)
@@DIA3_PORQUE@@
(porquê do dia 3)
@@DIA4_TITULO@@
(título do dia 4)
@@DIA4_NUTRICAO@@
(ação de nutrição do dia 4)
@@DIA4_MOVIMENTO@@
(ação de movimento/exercício do dia 4)
@@DIA4_COMPORTAMENTO@@
(ação de comportamento/sono do dia 4)
@@DIA4_PORQUE@@
(porquê do dia 4)
@@DIA5_TITULO@@
(título do dia 5)
@@DIA5_NUTRICAO@@
(ação de nutrição do dia 5)
@@DIA5_MOVIMENTO@@
(ação de movimento/exercício do dia 5)
@@DIA5_COMPORTAMENTO@@
(ação de comportamento/sono do dia 5)
@@DIA5_PORQUE@@
(porquê do dia 5)
@@FIM@@`;
}

function extractField(raw: string, key: string): string {
  const re = new RegExp("@@" + key + "@@([\\s\\S]*?)(?=@@|$)");
  const m = raw.match(re);
  return m ? m[1].trim() : "";
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!accessToken) {
    return NextResponse.json({ error: "Você precisa estar logada para gerar seu plano." }, { status: 401 });
  }

  const supabase = supabaseComoUsuario(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sessão inválida ou expirada. Entre novamente." }, { status: 401 });
  }
  const userId = userData.user.id;

  let body: { answers?: Partial<Answers>; dadosIniciais?: DadosIniciais };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const q1 = body.answers?.q1?.trim();
  const q2 = body.answers?.q2?.trim();
  const q3 = body.answers?.q3?.trim();

  if (!q1 || !q2 || !q3) {
    return NextResponse.json({ error: "Respostas incompletas." }, { status: 400 });
  }

  // Salva as respostas do questionário no Supabase antes de qualquer coisa relacionada à IA,
  // para não perder a resposta da pessoa caso a IA falhe ou a chave não esteja configurada.
  // Não bloqueia nem falha a geração do plano caso a gravação dê erro.
  const { error: dbError } = await supabase.from("respostas_questionario").insert({
    user_id: userId,
    altura_cm: body.dadosIniciais?.altura_cm,
    peso_atual_kg: body.dadosIniciais?.peso_atual_kg,
    peso_meta_kg: body.dadosIniciais?.peso_meta_kg,
    sinais_rotina: body.dadosIniciais?.sinais_rotina,
    q1_o_que_pesa: q1,
    q2_o_que_tentou: q2,
    q3_impacto_dia_a_dia: q3,
  });
  if (dbError) {
    console.error("Falha ao salvar respostas do questionário no Supabase:", dbError.message);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não está configurada no servidor." },
      { status: 500 }
    );
  }

  const prompt = buildPrompt({ q1, q2, q3 }, body.dadosIniciais?.tentativa_anterior);

  let message;
  try {
    message = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: err.message || `Erro da IA (HTTP ${err.status ?? "desconhecido"}).` },
        { status: err.status ?? 502 }
      );
    }
    return NextResponse.json(
      { error: "Falha ao conectar com a IA. Tente novamente." },
      { status: 502 }
    );
  }

  if (message.stop_reason === "refusal") {
    return NextResponse.json(
      { error: "A IA não conseguiu gerar essa análise agora. Toque para tentar de novo." },
      { status: 502 }
    );
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text" || !textBlock.text) {
    return NextResponse.json({ error: "A IA não retornou texto na resposta." }, { status: 502 });
  }

  const raw = textBlock.text;

  const perfil = extractField(raw, "PERFIL");
  const acolhimento = extractField(raw, "ACOLHIMENTO");
  const insight_cientifico = extractField(raw, "INSIGHT");

  const plano: PlanDay[] = [1, 2, 3, 4, 5].map((n) => ({
    dia: n,
    titulo: extractField(raw, `DIA${n}_TITULO`),
    nutricao: extractField(raw, `DIA${n}_NUTRICAO`),
    movimento: extractField(raw, `DIA${n}_MOVIMENTO`),
    comportamento: extractField(raw, `DIA${n}_COMPORTAMENTO`),
    porque: extractField(raw, `DIA${n}_PORQUE`),
  }));

  const planoValido = plano.every((d) => d.titulo && d.nutricao && d.movimento && d.comportamento);

  if (!perfil || !acolhimento || !planoValido) {
    const diaFaltando = plano.find((d) => !d.titulo || !d.nutricao || !d.movimento || !d.comportamento);
    const detalhe = diaFaltando ? ` (faltou o dia ${diaFaltando.dia})` : "";
    return NextResponse.json(
      { error: `A resposta da IA veio incompleta${detalhe}. Toque para tentar de novo.` },
      { status: 502 }
    );
  }

  const gerado_em = new Date().toISOString();

  const { error: planoError } = await supabase.from("planos").insert({
    user_id: userId,
    gerado_em,
    altura_cm: body.dadosIniciais?.altura_cm,
    peso_atual_kg: body.dadosIniciais?.peso_atual_kg,
    peso_meta_kg: body.dadosIniciais?.peso_meta_kg,
    perfil,
    acolhimento,
    insight_cientifico,
    dias: plano,
  });
  if (planoError) {
    console.error("Falha ao salvar o plano gerado no Supabase:", planoError.message);
  }

  const result: PlanResult = { perfil, acolhimento, insight_cientifico, plano, gerado_em };
  return NextResponse.json(result);
}
