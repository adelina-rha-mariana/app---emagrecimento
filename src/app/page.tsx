import Link from "next/link";
import { HeartHandshake, Sparkles, Footprints, TrendingUp } from "lucide-react";
import PageFooter from "./components/PageFooter";
import { LogoCompleta } from "./components/Logo";

// Landing page pública do Vixofit. Início do funil:
// Landing (aqui) -> /avaliacao (quiz + resultado, sem precisar de conta) ->
// /checkout -> /pagamento-aprovado -> /conta (se ainda não tiver) -> plano completo.
// (a experiência completa de perguntas/plano, que antes vivia em "/",
// agora mora em /avaliacao — ver src/app/avaliacao/page.tsx).

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

const DESTAQUES = [
  { icon: HeartHandshake, texto: "Plano feito pra você, não uma dieta genérica" },
  { icon: Sparkles, texto: "Personalizado por IA a partir do que você conta" },
  { icon: Footprints, texto: "Hábitos pequenos, no seu ritmo, todo dia" },
  { icon: TrendingUp, texto: "Acompanhamento do seu progresso ao longo do tempo" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
      `}</style>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <LogoCompleta width={200} />
          </div>

          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: "#F4EEE1", margin: "18px 0 14px" }}>
            Rotinas mais saudáveis, no seu ritmo.
          </h1>

          <p style={{ color: "#9CB3A8", fontSize: 15.5, lineHeight: 1.6, margin: "0 0 32px" }}>
            Um plano de hábitos e alimentação pensado a partir da sua própria rotina,
            sem promessas milagrosas, sem dieta pronta pra qualquer pessoa.
          </p>

          <div style={{ display: "grid", gap: 12, marginBottom: 36, textAlign: "left" }}>
            {DESTAQUES.map(({ icon: Icon, texto }) => (
              <div key={texto} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1B302A", border: "1px solid #2A4A40", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(240,161,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color="#F0A15C" />
                </div>
                <span style={{ color: "#F4EEE1", fontSize: 13.5 }}>{texto}</span>
              </div>
            ))}
          </div>

          <Link
            href="/avaliacao"
            style={{
              display: "block", width: "100%", padding: "17px 20px", borderRadius: 14,
              background: "linear-gradient(135deg, #F0A15C, #E8785A)", color: "#1B140D",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15.5, letterSpacing: 0.2,
              textDecoration: "none", boxShadow: "0 8px 20px -8px rgba(232,120,90,0.6)",
            }}
          >
            Quero começar
          </Link>

          <p style={{ color: "#6E7A73", fontSize: 12.5, lineHeight: 1.5, margin: "18px 0 0" }}>
            O Vixofit é um app de hábitos e bem-estar. Não substitui o acompanhamento de um profissional de saúde.
          </p>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
