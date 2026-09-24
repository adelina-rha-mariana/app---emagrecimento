import Link from "next/link";
import { BrandHeader } from "@/app/components/Logo";

// RASCUNHO — pendente de revisão jurídica antes de linkar no fluxo de
// consentimento (checkbox em /avaliacao). Preencher os campos marcados com
// [ ] antes de publicar. Ver conversa de auditoria pré-lançamento para contexto.
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

export default function TermosDeUsoPage() {
  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        a { color: #F0A15C; }
      `}</style>

      <main style={{ flex: 1, padding: "48px 20px 64px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 620, width: "100%" }}>
          <BrandHeader />
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 30, color: "#F4EEE1", margin: "14px 0 6px" }}>
            Termos de Uso
          </h1>
          <p style={{ color: "#7E8A83", fontSize: 12.5, margin: "0 0 32px" }}>
            Última atualização: [ data ]
          </p>

          <p style={{ color: "#F4EEE1", fontSize: 14.5, lineHeight: 1.7, margin: "0 0 32px" }}>
            Estes Termos de Uso regulam o uso do Vixofit, aplicativo de hábitos, nutrição e bem-estar.
            Ao criar uma conta, você concorda com o que está descrito aqui. Se algo não ficar claro, escreva
            para <a href="mailto:contato@vixofit.com">contato@vixofit.com</a>.
          </p>

          <Secao titulo="1. Quem oferece o serviço">
            <p style={{ margin: 0 }}>
              O Vixofit é operado por [ razão social ], CNPJ [ número ], com sede em [ endereço / cidade-UF ].
              Contato: <a href="mailto:contato@vixofit.com">contato@vixofit.com</a>.
            </p>
          </Secao>

          <Secao titulo="2. O que é o Vixofit">
            <p style={{ margin: "0 0 8px" }}>
              O Vixofit é um aplicativo de hábitos e bem-estar que gera planos personalizados de alimentação,
              movimento e comportamento com apoio de inteligência artificial, a partir de informações que você
              fornece.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#F4EEE1" }}>O Vixofit não é um serviço médico, não faz diagnóstico e não
              substitui o acompanhamento de nutricionista, médico ou psicólogo.</strong> O conteúdo gerado é
              educativo e comportamental, baseado no que você relata. Não avalia sua saúde clinicamente.
            </p>
          </Secao>

          <Secao titulo="3. Cadastro e conta">
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              <li>Você precisa criar uma conta (email e senha) para usar o Vixofit.</li>
              <li>Você é responsável por manter sua senha em sigilo e por tudo que acontecer na sua conta.</li>
              <li>As informações que você fornece no cadastro e na avaliação devem ser verdadeiras, na medida do
                seu conhecimento, já que o plano gerado é baseado nelas.</li>
              <li>Você pode pedir o encerramento da sua conta a qualquer momento pelo email de contato.</li>
            </ul>
          </Secao>

          <Secao titulo="4. Planos, pagamento e cancelamento">
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              <li>O acesso ao plano completo do Vixofit é pago, nos valores e condições informados na tela de
                checkout no momento da contratação.</li>
              <li>[ Completar: periodicidade da cobrança, mensal ou anual, renovação automática ou não, como
                cancelar a renovação. ]</li>
              <li>Por se tratar de uma compra feita fora de estabelecimento físico, você tem direito de
                arrependimento em até 7 (sete) dias corridos a partir da contratação, conforme o art. 49 do
                Código de Defesa do Consumidor, com devolução integral do valor pago.</li>
              <li>[ Completar: política de reembolso após o prazo de arrependimento, se houver. ]</li>
            </ul>
          </Secao>

          <Secao titulo="5. Disponibilidade do serviço">
            <p style={{ margin: "0 0 8px" }}>
              O Vixofit se compromete a empregar esforços razoáveis para manter o aplicativo disponível e
              funcionando corretamente. Ainda assim, o serviço pode ficar temporariamente indisponível por
              motivos como manutenção programada, atualizações, falhas técnicas, ou indisponibilidade de
              provedores terceiros dos quais o Vixofit depende (incluindo, mas não se limitando a, hospedagem,
              banco de dados, envio de email e serviços de inteligência artificial).
            </p>
            <p style={{ margin: 0 }}>
              Não garantimos disponibilidade ininterrupta (100% de uptime) nem um percentual mínimo específico
              de disponibilidade. Sempre que possível, interrupções programadas serão comunicadas com
              antecedência pelos canais do Vixofit.
            </p>
          </Secao>

          <Secao titulo="6. Limitação de responsabilidade">
            <p style={{ margin: "0 0 8px" }}>
              Na máxima extensão permitida pela legislação aplicável, o Vixofit não se responsabiliza por
              prejuízos indiretos, lucros cessantes ou perdas financeiras decorrentes de indisponibilidade
              temporária do sistema, falhas técnicas, ou interrupções causadas por terceiros dos quais o
              serviço depende.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              Esta limitação não afasta os direitos garantidos ao consumidor pelo Código de Defesa do
              Consumidor, nem exclui a responsabilidade do Vixofit por danos causados por dolo, culpa grave,
              ou descumprimento de obrigações essenciais do serviço.
            </p>
            <p style={{ margin: 0 }}>
              O conteúdo gerado pelo Vixofit (planos, sugestões, textos) é educativo e comportamental. O
              Vixofit não se responsabiliza por decisões de saúde tomadas exclusivamente com base nesse
              conteúdo, sem acompanhamento profissional. Reforçamos essa recomendação em várias telas do
              aplicativo.
            </p>
          </Secao>

          <Secao titulo="7. Propriedade intelectual">
            <p style={{ margin: 0 }}>
              A marca Vixofit, o design do aplicativo e o software são de propriedade [ da empresa / titular ].
              O plano gerado para você é de uso pessoal. Não pode ser revendido ou redistribuído.
            </p>
          </Secao>

          <Secao titulo="8. Encerramento">
            <p style={{ margin: 0 }}>
              Podemos suspender ou encerrar contas que violem estes Termos (ex: uso fraudulento, tentativa de
              acessar dados de outros usuários). Você pode encerrar sua conta a qualquer momento pelo email de
              contato.
            </p>
          </Secao>

          <Secao titulo="9. Alterações destes Termos">
            <p style={{ margin: 0 }}>
              Podemos atualizar estes Termos de tempos em tempos. Mudanças relevantes serão comunicadas antes
              de entrarem em vigor. O uso continuado do Vixofit após uma atualização representa concordância
              com os novos termos.
            </p>
          </Secao>

          <Secao titulo="10. Lei aplicável e foro">
            <p style={{ margin: 0 }}>
              Estes Termos são regidos pela lei brasileira. Fica eleito o foro da comarca de [ cidade/UF ] para
              dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja,
              ressalvado o foro do domicílio do consumidor quando aplicável por lei.
            </p>
          </Secao>

          <Secao titulo="Fale com a gente">
            <p style={{ margin: 0 }}>
              Dúvidas sobre estes Termos: escreva para{" "}
              <a href="mailto:contato@vixofit.com">contato@vixofit.com</a>.
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
