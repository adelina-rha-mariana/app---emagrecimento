import Link from "next/link";
import { BrandHeader } from "@/app/components/Logo";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: "#F4EEE1", margin: "0 0 10px" }}>
        {titulo}
      </h2>
      <div style={{ color: "#9CB3A8", fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function PoliticaDePrivacidadePage() {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        a { color: #F0A15C; }
      `}</style>

      <main style={{ flex: 1, padding: "48px 20px 64px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 620, width: "100%" }}>
          <BrandHeader />
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 30, color: "#F4EEE1", margin: "14px 0 6px" }}>
            Política de Privacidade
          </h1>
          <p style={{ color: "#6E7A73", fontSize: 12.5, margin: "0 0 32px" }}>
            Última atualização: 14 de setembro de 2026
          </p>

          <p style={{ color: "#F4EEE1", fontSize: 14.5, lineHeight: 1.7, margin: "0 0 32px" }}>
            Esta página explica, em linguagem simples, quais dados o Vixofit coleta, pra que usamos cada um,
            com quem compartilhamos, por quanto tempo guardamos e quais são os seus direitos. Se algo aqui não
            ficar claro, é só nos escrever. O contato está no fim da página.
          </p>

          <Secao titulo="Quais dados coletamos">
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              <li><strong style={{ color: "#F4EEE1" }}>Dados de rotina e hábitos:</strong> altura, peso atual, peso meta, os sinais de rotina que você marca (sono, alimentação, movimento, estresse) e as respostas abertas que você escreve sobre sua relação com comida, corpo e peso.</li>
              <li><strong style={{ color: "#F4EEE1" }}>Dados de uso do app:</strong> como sua avaliação de Dia 7 e registros manuais de glicose/pressão que você opta por guardar.</li>
              <li><strong style={{ color: "#F4EEE1" }}>Dados de pagamento:</strong> hoje o checkout do Vixofit é simulado e não processa pagamento real, então nenhum dado de cartão é coletado. Quando um meio de pagamento de verdade for ativado, essa seção será atualizada antes disso acontecer.</li>
            </ul>
          </Secao>

          <Secao titulo="Para que usamos cada dado">
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              <li>Seus dados de rotina e hábitos são usados <strong style={{ color: "#F4EEE1" }}>exclusivamente para personalizar seu plano de nutrição e hábitos</strong>, nunca para fins de diagnóstico médico ou qualquer avaliação clínica.</li>
              <li>Dados de pagamento (quando existirem) serão usados só para processar sua assinatura ou compra.</li>
            </ul>
          </Secao>

          <Secao titulo="Com quem compartilhamos">
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              <li><strong style={{ color: "#F4EEE1" }}>Supabase:</strong> a empresa que hospeda o banco de dados onde suas respostas ficam guardadas com segurança.</li>
              <li><strong style={{ color: "#F4EEE1" }}>Anthropic (Claude):</strong> a empresa de IA que processa suas respostas abertas pra gerar seu plano personalizado. Ela recebe só o texto necessário pra montar sua avaliação. Não usamos seus dados pra treinar modelos de terceiros.</li>
              <li><strong style={{ color: "#F4EEE1" }}>Processador de pagamento:</strong> quando um meio de pagamento real for integrado, o provedor escolhido receberá só os dados necessários pra processar a cobrança.</li>
            </ul>
            <p style={{ margin: "10px 0 0" }}>Não vendemos seus dados pra ninguém.</p>
          </Secao>

          <Secao titulo="Por quanto tempo guardamos">
            <p style={{ margin: 0 }}>
              Guardamos seus dados enquanto forem necessários pra te oferecer o serviço, ou até você pedir a
              exclusão. Você pode pedir a exclusão dos seus dados a qualquer momento pelo e-mail no fim desta página.
            </p>
          </Secao>

          <Secao titulo="Seus direitos (LGPD)">
            <p style={{ margin: "0 0 8px" }}>De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
              <li>Acessar os dados que temos sobre você;</li>
              <li>Corrigir dados incompletos ou desatualizados;</li>
              <li>Pedir a exclusão dos seus dados;</li>
              <li>Revogar, a qualquer momento, o consentimento que você deu para o uso dos seus dados de rotina/saúde.</li>
            </ul>
          </Secao>

          <Secao titulo="Fale com a gente">
            <p style={{ margin: 0 }}>
              Dúvidas sobre privacidade ou pedidos relacionados aos seus dados: escreva para{" "}
              <a href="mailto:contato@vixofit.com" style={{ textDecoration: "underline" }}>contato@vixofit.com</a>.
            </p>
          </Secao>

          <div style={{ marginTop: 40 }}>
            <Link href="/" style={{ color: "#9CB3A8", fontSize: 13, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
