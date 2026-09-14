import Link from "next/link";

// Rodapé simples com o link pra Política de Privacidade, usado nas páginas
// "de verdade" do funil (Landing, Checkout, Pagamento aprovado). Na SPA de
// /avaliacao (mockup de celular), o mesmo link aparece abaixo da moldura.
export default function PageFooter() {
  return (
    <footer style={{ padding: "20px 20px 28px", textAlign: "center" }}>
      <Link
        href="/politica-de-privacidade"
        style={{ color: "#6E7A73", fontSize: 12, textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        Política de Privacidade
      </Link>
    </footer>
  );
}
