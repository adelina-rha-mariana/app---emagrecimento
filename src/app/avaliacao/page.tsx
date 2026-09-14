"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft, HeartHandshake, Sparkles, BookOpen, Check, AlertCircle, Footprints,
  Music, Play, Pause, Volume2, VolumeX, ExternalLink, Droplets,
  Flame, TrendingUp, Share2, Award, Lock, Utensils, Dumbbell, Wind, Moon, Activity,
  Salad, Star,
} from "lucide-react";
import {
  Screen, ProgressDots, QTitle, Eyebrow, PrimaryButton, SecondaryButton, GhostLink, btnCircle,
} from "@/app/components/ui";
import NutricaoSobMedida from "@/app/components/NutricaoSobMedida";
import TelaAvaliacaoDia7 from "@/app/components/TelaAvaliacaoDia7";
import { buildShareLink, copyToClipboard } from "@/app/components/shareLink";

// ---- Design tokens ----
const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

type Answers = { q1: string; q2: string; q3: string };

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
};

const QUESTIONS: Array<{ key: keyof Answers; title: string; sub: string; placeholder: string }> = [
  {
    key: "q1",
    title: "O que mais pesa hoje quando você pensa em comida, corpo ou peso?",
    sub: "Pode escrever com suas próprias palavras, sem se preocupar em resumir.",
    placeholder: "Ex: eu como bem o dia todo, mas à noite perco o controle e depois me sinto culpada...",
  },
  {
    key: "q2",
    title: "O que você já tentou que não funcionou?",
    sub: "Dietas, apps, academia, jejum... o que não sustentou e por quê, se souber dizer.",
    placeholder: "Ex: já fiz low carb, funcionou por 3 semanas e depois voltei a comer tudo de novo...",
  },
  {
    key: "q3",
    title: "Como isso te afeta no seu dia a dia?",
    sub: "No trabalho, nas relações, em como você se vê — o que muda por causa disso.",
    placeholder: "Ex: evito sair pra jantar com amigas porque fico pensando no que vou comer...",
  },
];

// Sinais leves de rotina (sono, alimentação, movimento, estresse) — substitui
// a antiga lista de exames/condições médicas na tela de abertura, pra manter
// o primeiro contato num tom de bem-estar, não de triagem médica.
const ROTINA_SINAIS = [
  "Durmo mal ou poucas horas por noite",
  "Como de forma irregular (pulo refeições, belisco fora de hora)",
  "Quase não me movimento no dia a dia",
  "Sinto que o estresse pesa na minha rotina",
];

// TODO(pagamento): flag temporária SÓ PARA TESTE LOCAL — libera o conteúdo dos
// Dias 2 a 5 sem exigir pagamento, para permitir revisão de conteúdo.
// REVERTER (voltar para `false`) assim que o sistema de pagamento/paywall for implementado,
// para que os Dias 2-5 voltem a ficar bloqueados até a liberação paga.
const DEV_DESBLOQUEAR_TODOS_OS_DIAS = false;

// Steps de módulos à parte, fora da numeração sequencial do questionário/plano
// (eles controlam sua própria navegação interna e voltam pra tela principal via callback).
const STEP_NUTRICAO = 20;
const STEP_AVALIACAO_DIA7 = 21;

const WALK_MOODS = [
  { key: "presenca", icon: "🧘", label: "Presença", sub: "respiração guiada", url: "https://open.spotify.com/search/playlist%20mindfulness%20respira%C3%A7%C3%A3o" },
  { key: "relaxar", icon: "🌿", label: "Relaxar", sub: "sons ambiente", url: "https://open.spotify.com/search/playlist%20sons%20da%20natureza%20relaxar" },
  { key: "energizar", icon: "⚡", label: "Energizar", sub: "ritmo leve", url: "https://open.spotify.com/search/playlist%20caminhada%20energia" },
];

function Stepper({
  value,
  setValue,
  min,
  max,
  unit,
  big,
}: {
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  unit: string;
  big?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <button onClick={() => setValue(Math.max(min, value - 1))} style={btnCircle} aria-label="diminuir">–</button>
      <div style={{ minWidth: big ? 150 : 110, textAlign: "center" }}>
        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: big ? 64 : 48, color: "#F4EEE1", letterSpacing: -1 }}>
          {value}
        </span>
        <span style={{ fontSize: 16, color: "#9CB3A8", marginLeft: 6 }}>{unit}</span>
      </div>
      <button onClick={() => setValue(Math.min(max, value + 1))} style={btnCircle} aria-label="aumentar">+</button>
    </div>
  );
}

// Gráfico SVG customizado de evolução de peso projetada
function WeightChart({
  weightNow,
  weightGoal,
  weeks,
}: {
  weightNow: number;
  weightGoal: number;
  weeks: number;
}) {
  const w = 280, h = 130, pad = 22;
  const points = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const wk = (weeks / n) * i;
    const wt = weightNow - (weightNow - weightGoal) * (i / n);
    points.push({ wk, wt });
  }
  const minW = weightGoal - 1;
  const maxW = weightNow + 1;
  const xScale = (wk: number) => pad + (wk / weeks) * (w - pad * 2);
  const yScale = (wt: number) => h - pad - ((wt - minW) / (maxW - minW)) * (h - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.wk).toFixed(1)} ${yScale(p.wt).toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${xScale(points[points.length - 1].wk)} ${h - pad} L ${xScale(0)} ${h - pad} Z`;

  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0A15C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F0A15C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="#2A4A40" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="#F0A15C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xScale(p.wk)} cy={yScale(p.wt)} r={i === 0 || i === points.length - 1 ? 4 : 2.5} fill={i === points.length - 1 ? "#8FBF9F" : "#F0A15C"} />
      ))}
      <text x={pad} y={h - 4} fill="#9CB3A8" fontSize="10" fontFamily="Inter, sans-serif">hoje</text>
      <text x={w - pad} y={h - 4} fill="#9CB3A8" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="end">semana {weeks}</text>
    </svg>
  );
}

function buildWalkScript(result: PlanResult | null) {
  if (!result) {
    return [
      { pct: 0, text: "Vamos começar sua caminhada. Nos próximos minutos, esse é um tempo só seu." },
      { pct: 25, text: "Repare no seu ritmo de respiração. Não precisa acelerar, só precisa continuar." },
      { pct: 50, text: "Você já está na metade do caminho. Isso já é uma vitória de hoje." },
      { pct: 75, text: "Perceba como seu corpo se sente agora, comparado ao início." },
      { pct: 92, text: "Estamos quase terminando. Obrigada por escolher esse tempo pra você." },
    ];
  }
  const primeiroDia = result.plano && result.plano[0];
  return [
    { pct: 0, text: `Essa caminhada é sua. Você descreveu ${result.perfil}, e esse tempo agora é parte do seu processo.` },
    { pct: 22, text: result.insight_cientifico || "Cada pequeno movimento ajuda seu corpo e sua mente a trabalharem juntos." },
    { pct: 45, text: "Repare na sua respiração. Não precisa acelerar o passo, só continuar." },
    { pct: 70, text: primeiroDia ? `Lembre do porquê de hoje: ${primeiroDia.porque}` : "Você já percorreu mais da metade do caminho." },
    { pct: 90, text: "Estamos quase terminando. O que você fez agora já conta — obrigada por se escolher hoje." },
  ];
}

type DadosIniciais = {
  altura_cm: number;
  peso_atual_kg: number;
  peso_meta_kg: number;
  sinais_rotina: string[];
};

async function callClaude(answers: Answers, dadosIniciais: DadosIniciais): Promise<PlanResult> {
  // A chamada à Anthropic acontece no servidor (src/app/api/gerar-plano/route.ts),
  // usando ANTHROPIC_API_KEY como variável de ambiente — a chave nunca chega ao navegador.
  // O servidor também salva as respostas do questionário no Supabase.
  const response = await fetch("/api/gerar-plano", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, dadosIniciais }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.error) {
    throw new Error((data && data.error) || `Erro HTTP ${response.status}`);
  }

  return data as PlanResult;
}

export default function AvaliacaoApp() {
  // -1 rotina/consentimento | 0 welcome | 1 altura | 2 peso atual | 3 peso meta | 4 seus números
  // 5-7 perguntas abertas | 8 loading IA | 9 acolhimento IA | 10 plano IA | 11 caminhada guiada
  // 12 progresso | 13 meus números
  const [step, setStep] = useState(-1);
  const [height, setHeight] = useState(165);
  const [weightNow, setWeightNow] = useState(75);
  const [weightGoal, setWeightGoal] = useState(65);
  const [answers, setAnswers] = useState<Answers>({ q1: "", q2: "", q3: "" });
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rotina / consentimento
  const [rotina, setRotina] = useState<Record<string, boolean>>({});
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouDadosRotina, setAceitouDadosRotina] = useState(false);

  // Meus números
  const [glicose, setGlicose] = useState("");
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [numHistory, setNumHistory] = useState<
    Array<{ glicose: string; sistolica: string; diastolica: string; when: string }>
  >([]);

  // Indicar para uma amiga (compartilhamento)
  const [shareStatus, setShareStatus] = useState<"idle" | "copiado" | "erro">("idle");

  // Caminhada guiada
  const [walkMinutes, setWalkMinutes] = useState(15);
  const [walkElapsed, setWalkElapsed] = useState(0);
  const [walkRunning, setWalkRunning] = useState(false);
  const [walkMuted, setWalkMuted] = useState(false);
  const [walkMood, setWalkMood] = useState("presenca");
  const [caption, setCaption] = useState("");
  const spokenRef = useRef(new Set<number>());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const walkScript = buildWalkScript(result);
  const walkTotalSec = walkMinutes * 60;
  const activeMood = WALK_MOODS.find((m) => m.key === walkMood) || WALK_MOODS[0];

  useEffect(() => {
    if (walkRunning) {
      tickRef.current = setInterval(() => {
        setWalkElapsed((prev) => {
          const next = prev + 1;
          const pctNow = (next / walkTotalSec) * 100;
          walkScript.forEach((line) => {
            if (pctNow >= line.pct && !spokenRef.current.has(line.pct)) {
              spokenRef.current.add(line.pct);
              setCaption(line.text);
              if (!walkMuted && "speechSynthesis" in window) {
                const utter = new SpeechSynthesisUtterance(line.text);
                utter.lang = "pt-BR";
                utter.rate = 0.98;
                window.speechSynthesis.speak(utter);
              }
            }
          });
          if (next >= walkTotalSec) {
            if (tickRef.current) clearInterval(tickRef.current);
            setWalkRunning(false);
          }
          return next;
        });
      }, 1000);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
  }, [walkRunning, walkTotalSec, walkMuted]);

  const startWalk = () => { if (walkElapsed === 0) spokenRef.current = new Set(); setWalkRunning(true); };
  const pauseWalk = () => { setWalkRunning(false); if ("speechSynthesis" in window) window.speechSynthesis.pause(); };
  const resetWalk = () => { setWalkRunning(false); setWalkElapsed(0); setCaption(""); spokenRef.current = new Set(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  const walkMinsLeft = Math.max(0, Math.ceil((walkTotalSec - walkElapsed) / 60));
  const walkPct = Math.min(100, (walkElapsed / walkTotalSec) * 100);

  const totalOpenQuestions = QUESTIONS.length;
  const currentQ = QUESTIONS[step - 5];

  const imc = weightNow / Math.pow(height / 100, 2);
  const imcRounded = Math.round(imc * 10) / 10;
  let imcLabel = "Peso ideal";
  let imcColor = "#8FBF9F";
  if (imc < 18.5) { imcLabel = "Abaixo do peso"; imcColor = "#7FA6C9"; }
  else if (imc >= 25 && imc < 30) { imcLabel = "Sobrepeso"; imcColor = "#F0A15C"; }
  else if (imc >= 30) { imcLabel = "Obesidade"; imcColor = "#E8785A"; }
  const weightToLose = Math.max(0, weightNow - weightGoal);
  const weeksEstimate = Math.max(2, Math.round(weightToLose / 0.5));
  const gaugePct = Math.min(100, Math.max(0, ((imc - 15) / (35 - 15)) * 100));

  const canGoNext = () => {
    if (step >= 5 && step <= 7) return answers[QUESTIONS[step - 5].key].trim().length > 5;
    return true;
  };

  const handleNext = async () => {
    if (step < 7) { setStep(step + 1); return; }
    setStep(8);
    setLoading(true);
    setError(null);
    try {
      const res = await callClaude(answers, {
        altura_cm: height,
        peso_atual_kg: weightNow,
        peso_meta_kg: weightGoal,
        sinais_rotina: ROTINA_SINAIS.filter((c) => rotina[c]),
      });
      setResult(res);
      setLoading(false);
      setStep(9);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Não consegui gerar sua análise agora.");
    }
  };

  const goBack = () => {
    if (step === 8) return setStep(7);
    if (step === 13) return setStep(12);
    setStep(step - 1);
  };
  const showBack = step !== -1 && step !== 8 && step !== STEP_NUTRICAO && step !== STEP_AVALIACAO_DIA7;

  const saveNumber = () => {
    if (!glicose && !sistolica) return;
    setNumHistory([{ glicose, sistolica, diastolica, when: "agora" }, ...numHistory]);
    setGlicose(""); setSistolica(""); setDiastolica("");
  };

  const handleIndicarAmiga = async () => {
    const { url, mensagem } = buildShareLink();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Vixofit", text: mensagem, url });
        return;
      } catch {
        // usuária cancelou o share nativo ou o navegador falhou — cai pro fallback de copiar
      }
    }
    const ok = await copyToClipboard(`${mensagem} ${url}`);
    setShareStatus(ok ? "copiado" : "erro");
    setTimeout(() => setShareStatus("idle"), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1512", fontFamily: "Inter, sans-serif", padding: "24px 12px" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        textarea:focus, input:focus { outline: none; border-color: #F0A15C !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: 375, height: 780, maxHeight: "92vh", borderRadius: 42, border: "10px solid #05100C", background: "#12211D", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 130, height: 22, background: "#05100C", borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 10 }} />

        {showBack && (
          <div style={{ padding: "34px 20px 0", display: "flex", alignItems: "center" }}>
            <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <ChevronLeft size={22} color="#9CB3A8" />
            </button>
          </div>
        )}
        {!showBack && <div style={{ paddingTop: 34 }} />}

        {/* STEP -1: SAÚDE + COMPROMISSO */}
        {step === -1 && (
          <Screen>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 14, color: "#F0A15C", letterSpacing: 3 }}>
                VIXOFIT
              </span>
            </div>
            <Eyebrow icon={<Sparkles size={16} color="#F0A15C" />}>ANTES DE COMEÇARMOS</Eyebrow>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, lineHeight: 1.2, color: "#F4EEE1", margin: "4px 0 10px" }}>
              Sua jornada para uma rotina mais saudável começa aqui
            </h1>
            <p style={{ color: "#9CB3A8", fontSize: 14, lineHeight: 1.5, margin: "0 0 20px" }}>
              Queremos te conhecer um pouco antes de começar — sono, alimentação, movimento e rotina fazem parte da sua jornada.
            </p>

            <div style={{ fontSize: 11, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>COMO ANDA SUA ROTINA?</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              {ROTINA_SINAIS.map((c) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1B302A", borderRadius: 12, padding: "11px 14px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!rotina[c]}
                    onChange={() => setRotina({ ...rotina, [c]: !rotina[c] })}
                    style={{ width: 17, height: 17, accentColor: "#F0A15C", flexShrink: 0 }}
                  />
                  <span style={{ color: "#F4EEE1", fontSize: 13 }}>{c}</span>
                </label>
              ))}
            </div>
            <p style={{ color: "#6E7A73", fontSize: 11, lineHeight: 1.4, margin: "0 0 4px" }}>
              Marque o que fizer sentido pra você agora — não tem certo ou errado, isso só nos ajuda a personalizar sua jornada.
            </p>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 11, background: "rgba(240,161,92,0.08)", border: "1px solid rgba(240,161,92,0.25)", borderRadius: 14, padding: "15px 16px", marginTop: 18, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={() => setAceitouTermos(!aceitouTermos)}
                style={{ width: 18, height: 18, accentColor: "#F0A15C", flexShrink: 0, marginTop: 1 }}
              />
              <span style={{ color: "#F4EEE1", fontSize: 12.5, lineHeight: 1.5, fontWeight: 500 }}>
                Li e aceito os Termos de Uso e a{" "}
                <Link href="/politica-de-privacidade" style={{ color: "#F0A15C", textDecoration: "underline" }}>
                  Política de Privacidade
                </Link>.
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 11, background: "rgba(240,161,92,0.08)", border: "1px solid rgba(240,161,92,0.25)", borderRadius: 14, padding: "15px 16px", marginTop: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceitouDadosRotina}
                onChange={() => setAceitouDadosRotina(!aceitouDadosRotina)}
                style={{ width: 18, height: 18, accentColor: "#F0A15C", flexShrink: 0, marginTop: 1 }}
              />
              <span style={{ color: "#F4EEE1", fontSize: 12.5, lineHeight: 1.5, fontWeight: 500 }}>
                Autorizo o uso das informações sobre minha rotina e hábitos que eu compartilhar aqui exclusivamente
                para personalizar meu plano de nutrição e hábitos — esses dados nunca são usados para fins de
                diagnóstico médico.
              </span>
            </label>

            <div style={{ marginTop: 20 }}>
              <PrimaryButton onClick={() => setStep(0)} disabled={!aceitouTermos || !aceitouDadosRotina}>Continuar para avaliação</PrimaryButton>
            </div>
            <p style={{ color: "#6E7A73", fontSize: 10.5, lineHeight: 1.5, textAlign: "center", margin: "12px 0 0" }}>
              Este app não substitui o acompanhamento de um profissional de saúde.
            </p>
          </Screen>
        )}

        {step === 0 && (
          <Screen>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #F0A15C, #E8785A)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                <HeartHandshake size={26} color="#1B140D" />
              </div>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 32, lineHeight: 1.15, color: "#F4EEE1", margin: "0 0 12px" }}>
                Seus números, sua jornada.
              </h1>
              <p style={{ color: "#9CB3A8", fontSize: 15, lineHeight: 1.5, margin: 0 }}>
                Primeiro os índices (peso, IMC, quanto falta pra sua meta). Depois, 3 perguntas
                abertas pra IA montar um plano feito pra você de verdade.
              </p>
            </div>
            <PrimaryButton onClick={() => setStep(1)}>Começar</PrimaryButton>
          </Screen>
        )}

        {step === 1 && (
          <Screen>
            <ProgressDots step={0} total={3} />
            <QTitle>Qual sua altura?</QTitle>
            <div style={{ marginTop: 30 }}>
              <Stepper value={height} setValue={setHeight} min={140} max={210} unit="cm" big />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <PrimaryButton onClick={() => setStep(2)}>Continuar</PrimaryButton>
            </div>
          </Screen>
        )}
        {step === 2 && (
          <Screen>
            <ProgressDots step={1} total={3} />
            <QTitle>Qual seu peso atual?</QTitle>
            <div style={{ marginTop: 30 }}>
              <Stepper value={weightNow} setValue={setWeightNow} min={40} max={180} unit="kg" big />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <PrimaryButton onClick={() => setStep(3)}>Continuar</PrimaryButton>
            </div>
          </Screen>
        )}
        {step === 3 && (
          <Screen>
            <ProgressDots step={2} total={3} />
            <QTitle>Qual o peso dos seus sonhos?</QTitle>
            <div style={{ marginTop: 30 }}>
              <Stepper value={weightGoal} setValue={setWeightGoal} min={35} max={weightNow} unit="kg" big />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <PrimaryButton onClick={() => setStep(4)}>Ver minha avaliação</PrimaryButton>
            </div>
          </Screen>
        )}

        {step === 4 && (
          <Screen>
            <Eyebrow icon={<Sparkles size={16} color="#F0A15C" />}>SEUS ÍNDICES</Eyebrow>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#F4EEE1", margin: "4px 0 16px", fontWeight: 600 }}>
              De {weightNow}kg até {weightGoal}kg
            </h2>

            <div style={{ background: "#1B302A", borderRadius: 18, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: "#9CB3A8", fontSize: 13 }}>Seu IMC</span>
                <span style={{ color: imcColor, fontSize: 13, fontWeight: 700 }}>{imcLabel}</span>
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 42, fontWeight: 600, color: "#F4EEE1", margin: "4px 0 10px" }}>{imcRounded}</div>
              <div style={{ height: 8, background: "#2A4A40", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${gaugePct}%`, background: `linear-gradient(90deg, #7FA6C9, #8FBF9F, #F0A15C, #E8785A)`, opacity: 0.9 }} />
                <div style={{ position: "absolute", left: `calc(${gaugePct}% - 2px)`, top: -3, width: 4, height: 14, background: "#F4EEE1", borderRadius: 2 }} />
              </div>
            </div>

            <div style={{ background: "#1B302A", borderRadius: 18, padding: 16, marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(240,161,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Droplets size={18} color="#F0A15C" />
              </div>
              <div>
                <div style={{ color: "#F4EEE1", fontSize: 13, fontWeight: 600 }}>Faltam {weightToLose.toFixed(0)} kg para sua meta</div>
                <div style={{ color: "#9CB3A8", fontSize: 12, marginTop: 2 }}>No ritmo certo, cerca de {weeksEstimate} semanas</div>
              </div>
            </div>

            <div style={{ background: "#1B302A", borderRadius: 18, padding: "16px 8px" }}>
              <WeightChart weightNow={weightNow} weightGoal={weightGoal} weeks={weeksEstimate} />
            </div>

            <p style={{ color: "#6E7A73", fontSize: 11, lineHeight: 1.4, margin: "12px 0 16px" }}>
              Projeção com ritmo seguro (~0,5kg/semana) — sem promessas milagrosas.
            </p>

            <div style={{ marginTop: "auto" }}>
              <PrimaryButton onClick={() => setStep(5)}>Agora, quero te ouvir</PrimaryButton>
            </div>
          </Screen>
        )}

        {step >= 5 && step <= 7 && (
          <Screen>
            <ProgressDots step={step - 5} total={totalOpenQuestions} />
            <QTitle>{currentQ.title}</QTitle>
            <p style={{ color: "#9CB3A8", fontSize: 13, margin: "0 0 16px", lineHeight: 1.4 }}>{currentQ.sub}</p>
            <textarea
              value={answers[currentQ.key]}
              onChange={(e) => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              style={{
                width: "100%", minHeight: 140, borderRadius: 14, border: "1px solid #2A4A40",
                background: "#1B302A", color: "#F4EEE1", fontFamily: "Inter, sans-serif", fontSize: 14,
                padding: 16, lineHeight: 1.5, resize: "none",
              }}
            />
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <PrimaryButton onClick={handleNext} disabled={!canGoNext()}>
                {step === 7 ? "Gerar minha análise" : "Continuar"}
              </PrimaryButton>
            </div>
          </Screen>
        )}

        {step === 8 && (
          <Screen>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              {loading && (
                <>
                  <div style={{ width: 84, height: 84, borderRadius: "50%", border: "3px solid #2A4A40", borderTopColor: "#F0A15C", animation: "spin 0.9s linear infinite", marginBottom: 28 }} />
                  <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "#F4EEE1" }}>Lendo o que você escreveu...</p>
                  <p style={{ color: "#9CB3A8", fontSize: 13, marginTop: 6 }}>Cruzando com evidência científica pra montar algo seu.</p>
                </>
              )}
              {error && (
                <>
                  <AlertCircle size={40} color="#E8785A" style={{ marginBottom: 16 }} />
                  <p style={{ color: "#F4EEE1", fontSize: 14, marginBottom: 20 }}>{error}</p>
                  <PrimaryButton onClick={handleNext}>Tentar de novo</PrimaryButton>
                </>
              )}
            </div>
          </Screen>
        )}

        {step === 9 && result && (
          <Screen>
            <Eyebrow icon={<Sparkles size={16} color="#F0A15C" />}>SEU PERFIL</Eyebrow>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#F4EEE1", margin: "4px 0 18px", fontWeight: 600, lineHeight: 1.3 }}>
              {result.perfil}
            </h2>

            <div style={{ background: "#1B302A", borderRadius: 18, padding: 20, marginBottom: 14 }}>
              <p style={{ color: "#F4EEE1", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{result.acolhimento}</p>
            </div>

            <div style={{ background: "rgba(240,161,92,0.08)", border: "1px solid rgba(240,161,92,0.25)", borderRadius: 18, padding: 18, marginBottom: 14, display: "flex", gap: 12 }}>
              <BookOpen size={18} color="#F0A15C" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: "#F4EEE1", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{result.insight_cientifico}</p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <PrimaryButton onClick={() => setStep(10)}>Ver meu plano de 5 dias</PrimaryButton>
            </div>
          </Screen>
        )}

        {step === 10 && result && (
          <Screen>
            <span style={{ fontSize: 12, color: "#F0A15C", fontWeight: 700, letterSpacing: 0.5 }}>SEU PLANO, FEITO PRA VOCÊ</span>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: "#F4EEE1", margin: "4px 0 6px", fontWeight: 600 }}>
              5 dias no seu ritmo
            </h2>
            <p style={{ color: "#9CB3A8", fontSize: 12, margin: "0 0 16px" }}>
              Faltam {weightToLose.toFixed(0)}kg pra sua meta · ~{weeksEstimate} semanas no ritmo certo
            </p>

            {result.plano.map((d) => (
              <div key={d.dia} style={{ background: "#1B302A", border: d.dia === 1 ? "1px solid #F0A15C" : "1px solid #2A4A40", borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#F0A15C", fontSize: 12, fontWeight: 700 }}>DIA {d.dia}</span>
                  {d.dia === 1 || DEV_DESBLOQUEAR_TODOS_OS_DIAS ? (
                    <Check size={16} color="#8FBF9F" />
                  ) : (
                    <Lock size={13} color="#6E7A73" />
                  )}
                </div>
                <div style={{ color: "#F4EEE1", fontWeight: 600, fontSize: 15, marginBottom: 10 }}>{d.titulo}</div>

                {d.dia === 1 || DEV_DESBLOQUEAR_TODOS_OS_DIAS ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Utensils size={14} color="#8FBF9F" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: "#F4EEE1", fontSize: 12.5, lineHeight: 1.4 }}>{d.nutricao}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Dumbbell size={14} color="#E8785A" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: "#F4EEE1", fontSize: 12.5, lineHeight: 1.4 }}>{d.movimento}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Moon size={14} color="#7FA6C9" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: "#F4EEE1", fontSize: 12.5, lineHeight: 1.4 }}>{d.comportamento}</span>
                    </div>
                    <div style={{ color: "#9CB3A8", fontSize: 11.5, lineHeight: 1.4, fontStyle: "italic", marginTop: 2 }}>Por quê: {d.porque}</div>
                  </div>
                ) : (
                  <div style={{ color: "#6E7A73", fontSize: 12 }}>Desbloqueia ao concluir o dia anterior.</div>
                )}
              </div>
            ))}

            <p style={{ color: "#6E7A73", fontSize: 11, lineHeight: 1.5, margin: "10px 0 16px" }}>
              Isso é orientação baseada em hábitos e ciência comportamental — não substitui acompanhamento
              de nutricionista, psicólogo ou médico.
            </p>

            <SecondaryButton onClick={() => { resetWalk(); setStep(11); }} icon={<Footprints size={16} color="#F0A15C" style={{ marginRight: 2 }} />}>
              Iniciar caminhada guiada
            </SecondaryButton>
            <div style={{ marginTop: 10 }} />
            <SecondaryButton onClick={() => setStep(STEP_NUTRICAO)} icon={<Salad size={16} color="#F0A15C" style={{ marginRight: 2 }} />}>
              Nutrição sob medida
            </SecondaryButton>
            <div style={{ marginTop: 10 }} />
            <SecondaryButton onClick={() => setStep(12)} icon={<TrendingUp size={16} color="#F0A15C" style={{ marginRight: 2 }} />}>
              Ver meu progresso
            </SecondaryButton>
            <div style={{ marginTop: 10 }} />
            <PrimaryButton onClick={() => setStep(0)}>Refazer do zero</PrimaryButton>
          </Screen>
        )}

        {step === 11 && (
          <Screen>
            <Eyebrow icon={<Footprints size={16} color="#F0A15C" />}>CAMINHADA GUIADA</Eyebrow>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: "#F4EEE1", margin: "4px 0 16px", fontWeight: 600 }}>
              Movimento com propósito
            </h2>

            {walkElapsed === 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => setWalkMinutes(m)}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer",
                      border: walkMinutes === m ? "1.5px solid #F0A15C" : "1px solid #2A4A40",
                      background: walkMinutes === m ? "rgba(240,161,92,0.1)" : "#1B302A",
                      color: "#F4EEE1", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {WALK_MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setWalkMood(m.key)}
                  style={{
                    flex: 1, padding: "9px 4px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                    border: walkMood === m.key ? "1.5px solid #F0A15C" : "1px solid #2A4A40",
                    background: walkMood === m.key ? "rgba(240,161,92,0.1)" : "#1B302A",
                    color: "#F4EEE1", fontFamily: "Inter, sans-serif",
                  }}
                >
                  <div style={{ fontSize: 15 }}>{m.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 9, color: "#9CB3A8", marginTop: 1 }}>{m.sub}</div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 20px" }}>
              <div style={{ position: "relative", width: 170, height: 170 }}>
                <svg width="170" height="170" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="85" cy="85" r="74" fill="none" stroke="#2A4A40" strokeWidth="10" />
                  <circle
                    cx="85" cy="85" r="74" fill="none" stroke="#F0A15C" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 74}
                    strokeDashoffset={2 * Math.PI * 74 * (1 - walkPct / 100)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 600, color: "#F4EEE1" }}>{walkMinsLeft}</span>
                  <span style={{ color: "#9CB3A8", fontSize: 12 }}>min restantes</span>
                </div>
              </div>
            </div>

            <div style={{ minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: 16 }}>
              <p style={{ color: "#F4EEE1", fontSize: 13, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
                {caption || "Toque em começar quando estiver pronta."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button
                onClick={walkRunning ? pauseWalk : startWalk}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 0", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #F0A15C, #E8785A)", color: "#1B140D",
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                {walkRunning ? <Pause size={16} /> : <Play size={16} />}
                {walkRunning ? "Pausar" : walkElapsed > 0 ? "Continuar" : "Começar"}
              </button>
              <button
                onClick={() => setWalkMuted(!walkMuted)}
                style={{ width: 52, borderRadius: 14, border: "1px solid #2A4A40", background: "#1B302A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {walkMuted ? <VolumeX size={18} color="#9CB3A8" /> : <Volume2 size={18} color="#F0A15C" />}
              </button>
            </div>

            <a
              href={activeMood.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", borderRadius: 14, border: "1px solid #2A4A40", background: "#1B302A",
                color: "#F4EEE1", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13,
                textDecoration: "none", marginBottom: 14,
              }}
            >
              <Music size={15} color="#8FBF9F" /> Abrir playlist {activeMood.label} no Spotify <ExternalLink size={13} color="#9CB3A8" />
            </a>

            <p style={{ color: "#6E7A73", fontSize: 11, lineHeight: 1.5, textAlign: "center", margin: "0 0 6px" }}>
              A narração usa a voz do seu navegador — a música toca à parte, no Spotify.
            </p>

            <div style={{ marginTop: "auto" }}>
              <GhostLink onClick={() => setStep(10)}>Voltar ao plano</GhostLink>
            </div>
          </Screen>
        )}

        {/* STEP 12: PROGRESSO */}
        {step === 12 && (
          <Screen>
            <Eyebrow icon={<TrendingUp size={16} color="#F0A15C" />}>SUA EVOLUÇÃO</Eyebrow>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#F4EEE1", margin: "4px 0 6px", fontWeight: 600 }}>
              Você está indo bem.
            </h2>
            <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
              Constância importa mais que perfeição — olha o que você já construiu.
            </p>

            <div style={{ background: "linear-gradient(135deg, #1B302A, #12211D)", border: "1px solid #2A4A40", borderRadius: 18, padding: "22px 20px", textAlign: "center", marginBottom: 18 }}>
              <Flame size={26} color="#F0A15C" />
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 36, fontWeight: 700, color: "#F4EEE1", marginTop: 2 }}>1</div>
              <div style={{ color: "#9CB3A8", fontSize: 12 }}>dia completado no seu plano</div>
              <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                  <div key={i} style={{
                    flex: 1, aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: i === 0 ? "#F0A15C" : "rgba(255,255,255,0.06)",
                    color: i === 0 ? "#1B140D" : "#6E7A73",
                    border: i === 1 ? "1.5px solid #F0A15C" : "none",
                  }}>{d}</div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.5, margin: "0 0 10px" }}>PESO DESDE O INÍCIO</div>
            <div style={{ background: "#1B302A", borderRadius: 16, padding: "14px 8px", marginBottom: 18 }}>
              <WeightChart weightNow={weightNow} weightGoal={weightGoal} weeks={weeksEstimate} />
            </div>

            <div style={{ fontSize: 11, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.5, margin: "0 0 10px" }}>CONQUISTAS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
              {[
                { ic: <Award size={18} color="#1B140D" />, lab: "Primeiro dia", earned: true },
                { ic: <Utensils size={18} color="#1B140D" />, lab: "1ª refeição", earned: true },
                { ic: <Music size={18} color="#9CB3A8" />, lab: "1ª trilha", earned: false },
                { ic: <Moon size={18} color="#9CB3A8" />, lab: "1ª noite", earned: false },
              ].map((b, i) => (
                <div key={i} style={{
                  background: b.earned ? "rgba(240,161,92,0.15)" : "#1B302A", borderRadius: 12, padding: "10px 4px",
                  textAlign: "center", opacity: b.earned ? 1 : 0.5,
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: b.earned ? "#F0A15C" : "#2A4A40", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>{b.ic}</div>
                  <div style={{ fontSize: 9, color: "#F4EEE1", fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>{b.lab}</div>
                </div>
              ))}
            </div>

            <SecondaryButton onClick={() => setStep(13)} icon={<Activity size={16} color="#F0A15C" style={{ marginRight: 2 }} />}>
              Registrar glicose e pressão
            </SecondaryButton>
            <div style={{ marginTop: 10 }} />
            <SecondaryButton onClick={() => setStep(STEP_AVALIACAO_DIA7)} icon={<Star size={16} color="#F0A15C" style={{ marginRight: 2 }} />}>
              Avaliar minha semana (Dia 7)
            </SecondaryButton>

            <div style={{ marginTop: 14, background: "rgba(127,166,201,0.1)", border: "1px solid rgba(127,166,201,0.25)", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Share2 size={15} color="#7FA6C9" />
                <span style={{ color: "#F4EEE1", fontSize: 12.5, fontWeight: 700 }}>Gostando do resultado?</span>
              </div>
              <p style={{ color: "#9CB3A8", fontSize: 12, lineHeight: 1.5, margin: "0 0 12px" }}>
                Compartilhe com uma amiga — ela também pode começar a avaliação gratuita.
              </p>
              <SecondaryButton onClick={handleIndicarAmiga}>
                {shareStatus === "copiado" ? "Link copiado!" : shareStatus === "erro" ? "Não consegui copiar o link" : "Indicar para uma amiga"}
              </SecondaryButton>
            </div>

            <div style={{ marginTop: 16 }}>
              <GhostLink onClick={() => setStep(10)}>Voltar ao plano</GhostLink>
            </div>
          </Screen>
        )}

        {/* STEP 13: MEUS NÚMEROS */}
        {step === 13 && (
          <Screen>
            <Eyebrow icon={<Activity size={16} color="#F0A15C" />}>REGISTRO MANUAL</Eyebrow>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#F4EEE1", margin: "4px 0 8px", fontWeight: 600 }}>
              Seus números
            </h2>
            <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
              Meça no seu aparelho de casa e registre aqui. O app organiza seu histórico — ele não mede nada sozinho.
            </p>

            <div style={{ background: "rgba(240,161,92,0.08)", border: "1px solid rgba(240,161,92,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ color: "#F4EEE1", fontSize: 12.5, fontWeight: 700, marginBottom: 5 }}>Por que não medimos pelo celular?</div>
              <p style={{ color: "#9CB3A8", fontSize: 11.5, lineHeight: 1.5, margin: 0 }}>
                Não existe hoje tecnologia validada que meça glicose com o dedo na tela. Apps que prometem isso podem te dar um número errado — e isso é perigoso. Preferimos ser honestos com você.
              </p>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>GLICOSE (mg/dL)</label>
                <input
                  type="number" value={glicose} onChange={(e) => setGlicose(e.target.value)} placeholder="Ex: 95"
                  style={{ width: "100%", border: "1.5px solid #2A4A40", borderRadius: 10, padding: "11px 13px", fontSize: 14, background: "#1B302A", color: "#F4EEE1", fontFamily: "Inter, sans-serif" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>SISTÓLICA</label>
                  <input
                    type="number" value={sistolica} onChange={(e) => setSistolica(e.target.value)} placeholder="Ex: 120"
                    style={{ width: "100%", border: "1.5px solid #2A4A40", borderRadius: 10, padding: "11px 13px", fontSize: 14, background: "#1B302A", color: "#F4EEE1", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>DIASTÓLICA</label>
                  <input
                    type="number" value={diastolica} onChange={(e) => setDiastolica(e.target.value)} placeholder="Ex: 80"
                    style={{ width: "100%", border: "1.5px solid #2A4A40", borderRadius: 10, padding: "11px 13px", fontSize: 14, background: "#1B302A", color: "#F4EEE1", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 6, marginBottom: 18 }}>
              <PrimaryButton onClick={saveNumber}>Salvar registro</PrimaryButton>
            </div>

            {numHistory.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>HISTÓRICO</div>
                {numHistory.map((n, i) => (
                  <div key={i} style={{ background: "#1B302A", borderRadius: 12, padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#F4EEE1" }}>
                    <span>{n.glicose ? `Glicose: ${n.glicose} mg/dL` : ""}</span>
                    <span>{n.sistolica ? `${n.sistolica}/${n.diastolica || "—"}` : ""}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 11, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>FAIXAS DE REFERÊNCIA GERAL</div>
            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              <div style={{ background: "#1B302A", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#F4EEE1", marginBottom: 8 }}>🩸 Glicose em jejum</div>
                {[["Normal", "70–99 mg/dL", "#8FBF9F"], ["Atenção", "100–125 mg/dL", "#F0A15C"], ["Alto", "126+ mg/dL", "#E8785A"]].map((r) => (
                  <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderTop: "1px solid #2A4A40" }}>
                    <span style={{ color: "#9CB3A8" }}>{r[0]}</span><b style={{ color: r[2] }}>{r[1]}</b>
                  </div>
                ))}
              </div>
              <div style={{ background: "#1B302A", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#F4EEE1", marginBottom: 8 }}>❤️ Pressão arterial</div>
                {[["Normal", "até 120/80", "#8FBF9F"], ["Atenção", "121–139/81–89", "#F0A15C"], ["Alta", "140/90+", "#E8785A"]].map((r) => (
                  <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderTop: "1px solid #2A4A40" }}>
                    <span style={{ color: "#9CB3A8" }}>{r[0]}</span><b style={{ color: r[2] }}>{r[1]}</b>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ color: "#6E7A73", fontSize: 10.5, lineHeight: 1.5, textAlign: "center", margin: "0 0 10px" }}>
              Registro organizacional e educativo. Valores fora da faixa pedem atenção — procure um profissional de saúde.
            </p>

            <GhostLink onClick={() => setStep(12)}>Voltar ao progresso</GhostLink>
          </Screen>
        )}

        {/* STEP NUTRIÇÃO SOB MEDIDA */}
        {step === STEP_NUTRICAO && <NutricaoSobMedida onVoltar={() => setStep(10)} />}

        {/* STEP AVALIAÇÃO DIA 7 */}
        {step === STEP_AVALIACAO_DIA7 && <TelaAvaliacaoDia7 onVoltar={() => setStep(12)} />}
      </div>
    </div>
  );
}
