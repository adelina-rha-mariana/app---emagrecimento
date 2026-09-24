import { ShieldCheck } from "lucide-react";
import { COLORS } from "./ui";

// Gráfico ilustrativo comparando o padrão de "dieta restritiva / efeito
// sanfona" com uma abordagem gradual e personalizada, citando uma fonte
// científica real. Componente novo e isolado: não lê nada do banco nem
// depende de dados do usuário — a curva é conceitual, não um progresso real.

const LARGURA = 320;
const ALTURA = 120;
const MIN_ESCALA = 70;
const MAX_ESCALA = 115;

// Valores ilustrativos (não são dados de ninguém): a restritiva cai rápido
// e sobe de volta acima do ponto de partida (efeito sanfona); a gradual
// desce devagar e se sustenta.
const CURVA_RESTRITIVA = [100, 82, 74, 78, 92, 108, 112];
const CURVA_GRADUAL = [100, 96, 91, 87, 83, 80, 78];

function caminhoSvg(valores: number[]) {
  const passoX = LARGURA / (valores.length - 1);
  return valores
    .map((v, i) => {
      const x = i * passoX;
      const y = ALTURA - ((v - MIN_ESCALA) / (MAX_ESCALA - MIN_ESCALA)) * ALTURA;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const yLinhaBase = ALTURA - ((100 - MIN_ESCALA) / (MAX_ESCALA - MIN_ESCALA)) * ALTURA;

export default function ComparativoDietaRestritiva() {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(240,161,92,0.12)",
          borderRadius: 20, padding: "3px 10px", marginBottom: 8,
        }}
      >
        <ShieldCheck size={11} color={COLORS.accent} />
        <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 0.3 }}>BASEADO EM ESTUDOS</span>
      </div>

      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Por que o ritmo importa</div>
      <p style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.5, margin: "0 0 12px" }}>
        Dietas muito restritivas costumam derrubar o peso rápido, mas trazem boa parte de volta depois.
        Uma abordagem gradual, no seu ritmo, tende a se sustentar melhor.
      </p>

      <svg width="100%" viewBox={`0 0 ${LARGURA} ${ALTURA}`} style={{ display: "block", overflow: "visible" }}>
        <line x1={0} y1={yLinhaBase} x2={LARGURA} y2={yLinhaBase} stroke={COLORS.border} strokeDasharray="3 3" strokeWidth={1} />
        <path d={caminhoSvg(CURVA_RESTRITIVA)} fill="none" stroke={COLORS.accent2} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={caminhoSvg(CURVA_GRADUAL)} fill="none" stroke={COLORS.good} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div style={{ display: "flex", gap: 16, margin: "10px 0 12px" }}>
        <LegendaItem cor={COLORS.accent2} texto="Dieta restritiva" />
        <LegendaItem cor={COLORS.good} texto="Abordagem gradual" />
      </div>

      <div style={{ background: "rgba(143,191,159,0.08)", border: "1px solid rgba(143,191,159,0.25)", borderRadius: 12, padding: "10px 12px" }}>
        <p style={{ color: COLORS.text, fontSize: 12.5, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
          &ldquo;Um terço a dois terços das pessoas que fazem dieta recuperam mais peso do que perderam.&rdquo;
        </p>
        <p style={{ color: COLORS.textMuted, fontSize: 12, margin: "4px 0 0" }}>
          Mann, T., Tomiyama, A. J., Westling, E., Lew, A. M., Samuels, B., &amp; Chatman, J. (2007).
          Medicare&apos;s Search for Effective Obesity Treatments: Diets Are Not the Answer.
          <i> American Psychologist</i>, 62(3), 220–233.
        </p>
      </div>

      <p style={{ color: COLORS.textFaint, fontSize: 12, lineHeight: 1.4, margin: "8px 0 0" }}>
        Ilustração conceitual baseada em padrões descritos na literatura científica. Não representa dados reais de nenhum usuário.
      </p>
    </div>
  );
}

function LegendaItem({ cor, texto }: { cor: string; texto: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 3, borderRadius: 2, background: cor }} />
      <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{texto}</span>
    </div>
  );
}
