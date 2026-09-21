"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { COLORS } from "./ui";

// Calendário semanal (dom a sáb) com marcação nos dias em que o usuário
// abriu o app. Componente novo e isolado: usa só a tabela nova
// "checkins_diarios" (migration 0006) — não lê nem grava em nenhuma
// tabela existente, e não depende do quiz.

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function dataLocalISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inicioDaSemana(hoje: Date) {
  const d = new Date(hoje);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function StreakSemanal() {
  const [diasMarcados, setDiasMarcados] = useState<Set<string>>(new Set());
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const hoje = new Date();
      const hojeISO = dataLocalISO(hoje);
      const inicioSemana = dataLocalISO(inicioDaSemana(hoje));

      // marca hoje como usado (ignora se já existir uma linha pra esse dia)
      await supabase
        .from("checkins_diarios")
        .upsert({ user_id: user.id, dia: hojeISO }, { onConflict: "user_id,dia", ignoreDuplicates: true });

      const { data } = await supabase
        .from("checkins_diarios")
        .select("dia")
        .gte("dia", inicioSemana);

      if (!ativo) return;
      setDiasMarcados(new Set((data ?? []).map((r) => r.dia as string)));
      setCarregado(true);
    })();

    return () => {
      ativo = false;
    };
  }, []);

  if (!carregado) return null;

  const hoje = new Date();
  const inicioSemana = inicioDaSemana(hoje);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hojeISO = dataLocalISO(hoje);

  return (
    <div
      style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18,
        padding: "16px 14px", marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Flame size={16} color={COLORS.accent} />
        <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>Sua semana</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {dias.map((d, i) => {
          const iso = dataLocalISO(d);
          const usado = diasMarcados.has(iso);
          const ehHoje = iso === hojeISO;
          return (
            <div key={iso} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 700 }}>{DIAS_SEMANA[i]}</span>
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: usado ? "rgba(240,161,92,0.18)" : "transparent",
                  border: ehHoje ? `1.5px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                }}
              >
                {usado && <Flame size={14} color={COLORS.accent} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
