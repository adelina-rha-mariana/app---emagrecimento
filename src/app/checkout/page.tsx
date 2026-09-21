"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import PageFooter from "@/app/components/PageFooter";
import { BrandHeader } from "@/app/components/Logo";

// TODO(pagamento): nenhum gateway de pagamento está integrado ainda (Stripe,
// Mercado Pago, PagSeguro, etc.). Enquanto isso, PAGAMENTO_SIMULADO=true faz
// o botão "Pagar" simular uma aprovação instantânea e seguir o fluxo, só pra
// a ordem Landing -> Checkout -> Pagamento aprovado -> Avaliação funcionar
// de ponta a ponta. Quando o gateway real for integrado: trocar o onClick
// abaixo pela chamada ao checkout do provedor e apagar o badge "(simulado)".
const PAGAMENTO_SIMULADO = true;

const INCLUSOS = [
  "Avaliação personalizada, feita por IA a partir das suas respostas",
  "Plano de hábitos e nutrição em 5 dias",
  "Nutrição sob medida (Equilibrada, Low-carb, Cetogênica, Carnívora)",
  "Acompanhamento do seu progresso ao longo do tempo",
];

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

export default function CheckoutPage() {
  const router = useRouter();
  const [processando, setProcessando] = useState(false);

  const pagar = () => {
    setProcessando(true);
    // Simulação: em produção, aqui entraria a criação da sessão de pagamento
    // no gateway escolhido, e o redirecionamento aconteceria pela resposta dele.
    setTimeout(() => router.push("/pagamento-aprovado"), 900);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: "#F4EEE1", margin: 0 }}>
              Plano Vixofit
            </h1>
            {PAGAMENTO_SIMULADO && (
              <span style={{ fontSize: 10, color: "#9CB3A8", fontWeight: 700, letterSpacing: 0.4 }}>(simulado)</span>
            )}
          </div>
          <p style={{ color: "#F0A15C", fontSize: 26, fontFamily: "Fraunces, serif", fontWeight: 600, margin: "6px 0 18px" }}>
            R$ 89,90<span style={{ fontSize: 13, color: "#9CB3A8", fontFamily: "Inter, sans-serif", fontWeight: 500 }}> /mês</span>
          </p>

          <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
            {INCLUSOS.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Check size={15} color="#8FBF9F" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ color: "#F4EEE1", fontSize: 13, lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={pagar}
            disabled={processando}
            style={{
              width: "100%", padding: "16px 20px", borderRadius: 14, border: "none",
              background: processando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
              color: processando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
              fontSize: 15, cursor: processando ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            {processando && (
              <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(27,20,13,0.35)", borderTopColor: "#1B140D", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
            )}
            {processando ? "Processando..." : "Pagar e continuar"}
          </button>
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
