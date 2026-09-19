"use client";

import React, { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  ChevronLeft, Salad, Wheat, Flame, Beef, ShieldAlert, ShieldCheck, BookOpen,
  Check, Stethoscope, ClipboardCheck,
} from "lucide-react";
import {
  Screen, ProgressDots, QTitle, Eyebrow, PrimaryButton, GhostLink, COLORS,
} from "./ui";
import { ESTRATEGIAS, getEstrategiaById } from "./nutricaoEstrategias";
import fotoEquilibrada from "@/assets/nutricao/equilibrada.jpg";
import fotoLowCarb from "@/assets/nutricao/low-carb.jpg";
import fotoCetogenica from "@/assets/nutricao/cetogenica.jpg";
import fotoCarnivora from "@/assets/nutricao/carnivora.jpg";

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  equilibrada: Salad,
  "low-carb": Wheat,
  cetogenica: Flame,
  carnivora: Beef,
};

// Fotos ilustrativas (banco de imagens gratuito, Unsplash License) — só pra
// dar contexto visual à leitura, não representam um cardápio prescrito.
const FOTOS: Record<string, StaticImageData> = {
  equilibrada: fotoEquilibrada,
  "low-carb": fotoLowCarb,
  cetogenica: fotoCetogenica,
  carnivora: fotoCarnivora,
};

// Sub-passos internos do módulo, controlados aqui dentro — não interferem
// na numeração de `step` da tela principal (page.tsx).
type SubStep = "lista" | "triagem" | "modalidade" | "conteudo" | "resumo";

export default function NutricaoSobMedida({ onVoltar }: { onVoltar: () => void }) {
  const [subStep, setSubStep] = useState<SubStep>("lista");
  const [estrategiaId, setEstrategiaId] = useState<string | null>(null);
  const [condicoesMarcadas, setCondicoesMarcadas] = useState<Record<string, boolean>>({});
  const [riscoReconhecido, setRiscoReconhecido] = useState(false);
  const [modalidadeId, setModalidadeId] = useState<string | null>(null);

  const estrategia = estrategiaId ? getEstrategiaById(estrategiaId) : undefined;
  const cor = estrategia ? COLORS[estrategia.corId] : COLORS.accent;
  const algumaCondicao = estrategia ? estrategia.triagem.some((c) => condicoesMarcadas[c]) : false;

  const escolherEstrategia = (id: string) => {
    setEstrategiaId(id);
    setCondicoesMarcadas({});
    setRiscoReconhecido(false);
    setModalidadeId(null);
    setSubStep("triagem");
  };

  const voltarParaLista = () => {
    setEstrategiaId(null);
    setSubStep("lista");
  };

  const back = () => {
    if (subStep === "triagem") return voltarParaLista();
    if (subStep === "modalidade") return setSubStep("triagem");
    if (subStep === "conteudo") return setSubStep("modalidade");
    if (subStep === "resumo") return setSubStep("conteudo");
    return onVoltar();
  };

  const subStepIndex = { triagem: 0, modalidade: 1, conteudo: 2, resumo: 3 } as const;

  return (
    <>
      <div style={{ padding: "34px 20px 0", display: "flex", alignItems: "center" }}>
        <button onClick={back} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ChevronLeft size={22} color={COLORS.textMuted} />
        </button>
      </div>

      {subStep === "lista" && (
        <Screen>
          <Eyebrow icon={<Salad size={16} color={COLORS.accent} />}>NUTRIÇÃO SOB MEDIDA</Eyebrow>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: COLORS.text, margin: "4px 0 8px", fontWeight: 600 }}>
            Escolha uma estratégia alimentar
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
            Cada estratégia tem uma triagem de segurança, opções de modalidade e conteúdo educativo.
            Nenhuma delas é obrigatória nem substitui acompanhamento profissional.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {ESTRATEGIAS.map((e) => {
              const Icon = ICONS[e.id];
              const c = COLORS[e.corId];
              return (
                <button
                  key={e.id}
                  onClick={() => escolherEstrategia(e.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                    background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16,
                    padding: "14px 16px", cursor: "pointer", width: "100%",
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${c}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={c} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{e.nome}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>{e.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <p style={{ color: COLORS.textFaint, fontSize: 10.5, lineHeight: 1.5, textAlign: "center", margin: "20px 0 0" }}>
            Este conteúdo é educativo e não substitui o acompanhamento de um profissional de saúde e nutrição.
          </p>
        </Screen>
      )}

      {estrategia && subStep !== "lista" && (
        <Screen>
          <ProgressDots step={subStepIndex[subStep as Exclude<SubStep, "lista">]} total={4} />

          {subStep === "triagem" && (
            <>
              <Eyebrow icon={<Stethoscope size={16} color={cor} />}>{estrategia.nome.toUpperCase()} · TRIAGEM DE SEGURANÇA</Eyebrow>
              <QTitle>Alguma dessas situações é sua?</QTitle>
              <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 16px", lineHeight: 1.4 }}>
                Marque o que se aplica. Isso não avalia sua saúde de verdade, é só pra saber se vale buscar
                orientação profissional antes de seguir com essa estratégia.
              </p>
              {estrategia.triagem.length > 0 ? (
                <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                  {estrategia.triagem.map((c) => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.card, borderRadius: 12, padding: "11px 14px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!condicoesMarcadas[c]}
                        onChange={() => setCondicoesMarcadas({ ...condicoesMarcadas, [c]: !condicoesMarcadas[c] })}
                        style={{ width: 17, height: 17, accentColor: cor, flexShrink: 0 }}
                      />
                      <span style={{ color: COLORS.text, fontSize: 13 }}>{c}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ background: COLORS.card, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>Nenhuma restrição especial pra essa estratégia, pode seguir direto.</span>
                </div>
              )}

              {algumaCondicao && (
                <div style={{ background: "rgba(232,120,90,0.1)", border: "1px solid rgba(232,120,90,0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <ShieldAlert size={16} color={COLORS.accent2} />
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 700 }}>Fale com seu médico antes de começar</span>
                  </div>
                  <p style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.5, margin: "0 0 12px" }}>
                    Com o que você marcou, essa estratégia precisa de acompanhamento profissional direto para ser segura.
                    Você ainda pode ver o conteúdo educativo, mas não deve começar sozinho(a).
                  </p>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={riscoReconhecido}
                      onChange={() => setRiscoReconhecido(!riscoReconhecido)}
                      style={{ width: 17, height: 17, accentColor: cor, flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={{ color: COLORS.text, fontSize: 12, lineHeight: 1.4 }}>
                      Entendo o risco e vou buscar (ou já tenho) acompanhamento médico antes de seguir.
                    </span>
                  </label>
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: 10 }}>
                <PrimaryButton
                  onClick={() => setSubStep("modalidade")}
                  disabled={algumaCondicao && !riscoReconhecido}
                >
                  Continuar
                </PrimaryButton>
              </div>
            </>
          )}

          {subStep === "modalidade" && (
            <>
              <Eyebrow icon={<ClipboardCheck size={16} color={cor} />}>{estrategia.nome.toUpperCase()} · MODALIDADE</Eyebrow>
              <QTitle>Qual jeito faz mais sentido pra você?</QTitle>
              <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 16px", lineHeight: 1.4 }}>
                Dá pra trocar de modalidade depois, comece pela que parecer mais fácil de sustentar.
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {estrategia.modalidades.map((m) => (
                  <label
                    key={m.id}
                    style={{
                      display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
                      background: COLORS.card, borderRadius: 14, padding: "14px 16px",
                      border: modalidadeId === m.id ? `1.5px solid ${cor}` : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="modalidade"
                      checked={modalidadeId === m.id}
                      onChange={() => setModalidadeId(m.id)}
                      style={{ width: 17, height: 17, accentColor: cor, flexShrink: 0, marginTop: 2 }}
                    />
                    <div>
                      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13.5 }}>{m.nome}</div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{m.descricao}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <PrimaryButton onClick={() => setSubStep("conteudo")} disabled={!modalidadeId}>
                  Continuar
                </PrimaryButton>
              </div>
            </>
          )}

          {subStep === "conteudo" && (
            <>
              <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, position: "relative", height: 140 }}>
                <Image
                  src={FOTOS[estrategia.id]}
                  alt={`Prato ilustrativo da estratégia ${estrategia.nome}`}
                  fill
                  sizes="400px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <Eyebrow icon={<BookOpen size={16} color={cor} />}>{estrategia.nome.toUpperCase()} · CONTEÚDO EDUCATIVO</Eyebrow>
              <QTitle>O que é e como funciona</QTitle>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.55, margin: "0 0 10px" }}>{estrategia.conteudoEducativo.oQueE}</p>
                <p style={{ color: COLORS.textMuted, fontSize: 12.5, lineHeight: 1.55, margin: 0 }}>{estrategia.conteudoEducativo.comoFunciona}</p>
              </div>

              <SecaoLista titulo="Possíveis benefícios" itens={estrategia.conteudoEducativo.beneficios} icon={<Check size={13} color={COLORS.good} />} />
              <SecaoLista titulo="Pontos de atenção" itens={estrategia.conteudoEducativo.atencao} icon={<ShieldAlert size={13} color={COLORS.accent2} />} />
              <SecaoLista titulo="Dicas práticas" itens={estrategia.conteudoEducativo.dicasPraticas} icon={<Check size={13} color={cor} />} />

              {estrategia.avisoExtra && (
                <div style={{ background: "rgba(232,120,90,0.08)", border: "1px solid rgba(232,120,90,0.25)", borderRadius: 14, padding: "14px 16px", marginTop: 4, marginBottom: 14 }}>
                  <p style={{ color: COLORS.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{estrategia.avisoExtra}</p>
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: 10 }}>
                <PrimaryButton onClick={() => setSubStep("resumo")}>Continuar</PrimaryButton>
              </div>
            </>
          )}

          {subStep === "resumo" && (
            <>
              <Eyebrow icon={<ShieldCheck size={16} color={cor} />}>{estrategia.nome.toUpperCase()} · RESUMO</Eyebrow>
              <QTitle>Sua escolha</QTitle>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>ESTRATÉGIA</div>
                <div style={{ color: COLORS.text, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{estrategia.nome}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>MODALIDADE</div>
                <div style={{ color: COLORS.text, fontSize: 14 }}>{estrategia.modalidades.find((m) => m.id === modalidadeId)?.nome}</div>
              </div>

              <div style={{ background: "rgba(240,161,92,0.08)", border: "1px solid rgba(240,161,92,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 18, display: "flex", gap: 10 }}>
                <Stethoscope size={16} color={COLORS.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: COLORS.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                  Este conteúdo é educativo e não substitui o acompanhamento de um profissional de saúde e
                  nutrição. Converse com um profissional antes de mudar sua alimentação de forma significativa.
                </p>
              </div>

              <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
                <PrimaryButton onClick={voltarParaLista}>Ver outra estratégia</PrimaryButton>
                <GhostLink onClick={onVoltar}>Voltar ao plano</GhostLink>
              </div>
            </>
          )}
        </Screen>
      )}
    </>
  );
}

function SecaoLista({ titulo, itens, icon }: { titulo: string; itens: string[]; icon: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>{titulo.toUpperCase()}</div>
      <div style={{ display: "grid", gap: 7 }}>
        {itens.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ marginTop: 3, flexShrink: 0 }}>{icon}</span>
            <span style={{ color: COLORS.text, fontSize: 12.5, lineHeight: 1.45 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
