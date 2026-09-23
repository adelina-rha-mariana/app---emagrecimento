"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { COLORS } from "./ui";

// Timer circular de progresso do plano de 5 dias, estilo apps de jejum
// intermitente. Componente novo e independente: só recebe gerado_em (que a
// tela do plano já tem) e calcula tudo em cima disso — não lê nem grava
// nada no banco, não depende do quiz nem de nenhuma tabela nova.

const TOTAL_DIAS = 5;
const HORAS_POR_DIA = 24;

function calcularProgresso(geradoEm: string, agora: number) {
  const horasDecorridas = Math.max(0, (agora - new Date(geradoEm).getTime()) / 3_600_000);
  const diaAtual = Math.min(TOTAL_DIAS, Math.max(1, Math.floor(horasDecorridas / HORAS_POR_DIA) + 1));
  const fracaoTotal = Math.min(1, horasDecorridas / (TOTAL_DIAS * HORAS_POR_DIA));
  const horasRestantesPlano = Math.max(0, TOTAL_DIAS * HORAS_POR_DIA - horasDecorridas);
  return { horasDecorridas, diaAtual, fracaoTotal, horasRestantesPlano };
}

function formatarDuracao(horas: number) {
  let dias = Math.floor(horas / 24);
  let horasRestantes = Math.round(horas % 24);
  if (horasRestantes === 24) {
    dias += 1;
    horasRestantes = 0;
  }
  if (dias > 0) return `${dias}d ${horasRestantes}h`;
  return `${horasRestantes}h`;
}

export default function TimerProgressoPlano({ geradoEm }: { geradoEm: string }) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { diaAtual, fracaoTotal, horasDecorridas, horasRestantesPlano } = calcularProgresso(geradoEm, agora);
  const completo = fracaoTotal >= 1;

  const tamanho = 104;
  const raio = 44;
  const espessura = 10;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - fracaoTotal);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 16, background: COLORS.card,
        border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 16, marginBottom: 14,
      }}
    >
      <div style={{ position: "relative", width: tamanho, height: tamanho, flexShrink: 0 }}>
        <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`}>
          <circle cx={tamanho / 2} cy={tamanho / 2} r={raio} fill="none" stroke={COLORS.border} strokeWidth={espessura} />
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 34, color: COLORS.text, lineHeight: 1 }}>
            {diaAtual}
          </span>
          <span style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>de {TOTAL_DIAS}</span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(240,161,92,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Flame size={16} color={COLORS.accent} />
          </div>
          <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>
            {completo ? "Plano concluído" : `Dia ${diaAtual} em andamento`}
          </span>
        </div>
        <p style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.4, margin: 0 }}>
          {completo
            ? `Você chegou aos 5 dias. Já se passaram ${formatarDuracao(horasDecorridas)} desde o início.`
            : `Começou há ${formatarDuracao(horasDecorridas)} · faltam ${formatarDuracao(horasRestantesPlano)} pro fim do plano.`}
        </p>
      </div>
    </div>
  );
}
