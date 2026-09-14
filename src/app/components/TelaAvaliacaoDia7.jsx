"use client";

// Tela de avaliação do Dia 7: pede uma nota de 0 a 10 sobre a experiência
// na primeira semana e um comentário opcional, e salva na tabela
// "avaliacoes_dia7" do Supabase (ver supabase/migrations/0002_create_avaliacoes_dia7.sql).

import React, { useState } from "react";
import { Star, Check, AlertCircle } from "lucide-react";
import { Screen, QTitle, Eyebrow, PrimaryButton, GhostLink, COLORS } from "./ui";
import { supabase } from "@/lib/supabase";

const NOTAS = Array.from({ length: 11 }, (_, i) => i); // 0..10

export default function TelaAvaliacaoDia7({ onVoltar }) {
  const [nota, setNota] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);

  const enviar = async () => {
    if (nota === null) return;
    setEnviando(true);
    setErro(null);
    const { error } = await supabase.from("avaliacoes_dia7").insert({
      nota,
      comentario: comentario.trim() || null,
    });
    setEnviando(false);
    if (error) {
      setErro("Não consegui salvar sua avaliação agora. Pode tentar de novo?");
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <Screen>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Check size={26} color={COLORS.good} />
          </div>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: COLORS.text, margin: "0 0 8px", fontWeight: 600 }}>
            Obrigada pela sua avaliação
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Sua nota nos ajuda a melhorar o programa pra quem vem depois de você.
          </p>
        </div>
        <GhostLink onClick={onVoltar}>Voltar ao progresso</GhostLink>
      </Screen>
    );
  }

  return (
    <Screen>
      <Eyebrow icon={<Star size={16} color={COLORS.accent} />}>DIA 7 · SUA AVALIAÇÃO</Eyebrow>
      <QTitle>De 0 a 10, o quanto você recomendaria essa primeira semana pra uma amiga?</QTitle>
      <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 18px", lineHeight: 1.4 }}>
        0 é &quot;não recomendaria de jeito nenhum&quot;, 10 é &quot;recomendaria com certeza&quot;.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
        {NOTAS.map((n) => (
          <button
            key={n}
            onClick={() => setNota(n)}
            style={{
              aspectRatio: "1", borderRadius: 10, cursor: "pointer",
              border: nota === n ? `1.5px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
              background: nota === n ? "rgba(240,161,92,0.15)" : COLORS.card,
              color: nota === n ? COLORS.accent : COLORS.text,
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 0.4, marginBottom: 8 }}>
        QUER CONTAR MAIS ALGUMA COISA? (OPCIONAL)
      </label>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Ex: o que ajudou mais, o que poderia ser diferente..."
        style={{
          width: "100%", minHeight: 100, borderRadius: 14, border: `1px solid ${COLORS.border}`,
          background: COLORS.card, color: COLORS.text, fontFamily: "Inter, sans-serif", fontSize: 14,
          padding: 16, lineHeight: 1.5, resize: "none", marginBottom: 14,
        }}
      />

      {erro && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <AlertCircle size={15} color={COLORS.accent2} />
          <span style={{ color: COLORS.text, fontSize: 12.5 }}>{erro}</span>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 10 }}>
        <PrimaryButton onClick={enviar} disabled={nota === null || enviando}>
          {enviando ? "Enviando..." : "Enviar avaliação"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
