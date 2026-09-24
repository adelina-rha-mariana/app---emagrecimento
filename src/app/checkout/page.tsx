"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import PageFooter from "@/app/components/PageFooter";
import { BrandHeader } from "@/app/components/Logo";
import { supabase } from "@/lib/supabase";

// Checkout real da Kiwify (pagamento único). O user_id vai no parâmetro s1,
// que a Kiwify devolve no payload do webhook — é assim que o backend sabe pra
// qual conta liberar o acesso depois de confirmar o pagamento de verdade.
// Ver src/app/api/webhook-kiwify/route.ts.
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/HUeTau6";

const INCLUSOS = [
  "Avaliação personalizada, feita por IA a partir das suas respostas",
  "Plano de hábitos e nutrição em 5 dias",
  "Nutrição sob medida (Equilibrada, Low-carb, Cetogênica, Carnívora)",
  "Acompanhamento do seu progresso ao longo do tempo",
];

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

export default function CheckoutPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (ativo) setUserId(data.session?.user.id ?? null);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  // O user_id vai como parâmetro s1 — a Kiwify devolve isso no webhook, então
  // é assim que o backend sabe pra qual conta liberar o acesso depois de
  // confirmar o pagamento de verdade (ver src/app/api/webhook-kiwify/route.ts).
  const linkPagamento = userId ? `${KIWIFY_CHECKOUT_URL}?s1=${encodeURIComponent(userId)}` : null;

  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <BrandHeader />
        </div>

        <div style={{ background: "#1B302A", border: "1px solid #2A4A40", borderRadius: 20, padding: 24 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: "#F4EEE1", margin: 0 }}>
            Plano Vixofit
          </h1>
          <p style={{ color: "#F0A15C", fontSize: 26, fontFamily: "Fraunces, serif", fontWeight: 600, margin: "6px 0 18px" }}>
            R$ 89,90<span style={{ fontSize: 13, color: "#9CB3A8", fontFamily: "Inter, sans-serif", fontWeight: 500 }}> pagamento único</span>
          </p>

          <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
            {INCLUSOS.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Check size={15} color="#8FBF9F" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ color: "#F4EEE1", fontSize: 13, lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>

          <a
            href={linkPagamento ?? undefined}
            aria-disabled={!linkPagamento}
            style={{
              width: "100%", padding: "16px 20px", borderRadius: 14, border: "none",
              background: linkPagamento ? "linear-gradient(135deg, #F0A15C, #E8785A)" : "#3A3F3A",
              color: linkPagamento ? "#1B140D" : "#7A8079", fontFamily: "Inter, sans-serif", fontWeight: 700,
              fontSize: 15, cursor: linkPagamento ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              textDecoration: "none", pointerEvents: linkPagamento ? "auto" : "none",
            }}
          >
            {linkPagamento ? "Pagar e continuar" : "Um momento..."}
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/" style={{ color: "#9CB3A8", fontSize: 13, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Voltar
          </Link>
        </div>
      </div>
      </main>
      <PageFooter />
    </div>
  );
}
