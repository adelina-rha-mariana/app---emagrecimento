import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PageFooter from "@/app/components/PageFooter";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

export default function PagamentoAprovadoPage() {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
      `}</style>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={30} color="#8FBF9F" />
        </div>

        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, color: "#F4EEE1", margin: "0 0 10px" }}>
          Pagamento aprovado!
        </h1>
        <p style={{ color: "#9CB3A8", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 30px" }}>
          Agora vamos te conhecer melhor pra montar sua avaliação e seu plano de hábitos personalizado.
        </p>

        <Link
          href="/avaliacao"
          style={{
            display: "block", width: "100%", padding: "17px 20px", borderRadius: 14,
            background: "linear-gradient(135deg, #F0A15C, #E8785A)", color: "#1B140D",
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15.5,
            textDecoration: "none", boxShadow: "0 8px 20px -8px rgba(232,120,90,0.6)",
          }}
        >
          Começar minha avaliação
        </Link>
      </div>
      </main>
      <PageFooter />
    </div>
  );
}
