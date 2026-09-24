"use client";

// Peças de UI compartilhadas entre a tela principal (page.tsx) e os módulos
// de fluxo (ex: Nutrição sob medida, avaliação do Dia 7), pra manter a
// mesma identidade visual do app em todo lugar.

import React from "react";

export const COLORS = {
  bg: "#0B1512",
  card: "#1B302A",
  border: "#2A4A40",
  text: "#F4EEE1",
  textMuted: "#9CB3A8",
  textFaint: "#7E8A83",
  accent: "#F0A15C",
  accent2: "#E8785A",
  good: "#8FBF9F",
  info: "#7FA6C9",
};

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "28px 24px 24px", overflowY: "auto" }}>
      {children}
    </div>
  );
}

export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 22 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 4, width: i === step ? 22 : 14, borderRadius: 4, background: i <= step ? COLORS.accent : COLORS.border, transition: "all 0.3s ease" }} />
      ))}
    </div>
  );
}

export function QTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 600, color: COLORS.text, margin: "0 0 8px", lineHeight: 1.3 }}>
      {children}
    </h2>
  );
}

export function Eyebrow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      {icon}
      <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 0.5 }}>{children}</span>
    </div>
  );
}

export const btnCircle = {
  width: 44, height: 44, borderRadius: "50%", border: `1px solid ${COLORS.border}`, background: COLORS.card,
  color: COLORS.accent, fontSize: 22, fontFamily: "Inter, sans-serif", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
} as const;

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "16px 20px", borderRadius: 14, border: "none",
        background: disabled ? "#3A3F3A" : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
        color: disabled ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
        fontSize: 15, letterSpacing: 0.2, cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 8px 20px -8px rgba(232,120,90,0.6)", transition: "transform 0.15s ease",
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 20px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.card,
        color: COLORS.text, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}
    >
      {icon}{children}
    </button>
  );
}

export function GhostLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "10px 0", background: "none", border: "none", cursor: "pointer",
        color: COLORS.textMuted, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
        textDecoration: "underline", textUnderlineOffset: 3,
      }}
    >
      {children}
    </button>
  );
}
