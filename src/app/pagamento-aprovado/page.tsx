"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PageFooter from "@/app/components/PageFooter";
import { BrandHeader } from "@/app/components/Logo";
import { supabase } from "@/lib/supabase";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

// A Kiwify traz a pessoa de volta pra essa URL logo depois de pagar, mas o
// webhook (que é quem realmente confirma o pagamento e libera o acesso) pode
// levar alguns segundos a mais pra chegar. Por isso essa tela espera e
// verifica de novo em vez de assumir sucesso só por ter sido acessada.
const INTERVALO_VERIFICACAO_MS = 3000;
const TIMEOUT_TOTAL_MS = 60000;

type Estado = "verificando" | "aprovado" | "demorando";

export default function PagamentoAprovadoPage() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [precisaCadastro, setPrecisaCadastro] = useState(true);
  const tentativasRef = useRef(0);

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;

    const verificar = async () => {
      // getUser() sempre busca o dado atual no servidor (não usa cache local),
      // então reflete o pago:true assim que o webhook gravar no Supabase.
      const { data } = await supabase.auth.getUser();
      if (!ativo) return;
      const user = data.user;
      // app_metadata (não user_metadata) — só o servidor consegue gravar isso.
      const pago = (user?.app_metadata as { pago?: boolean } | undefined)?.pago === true;

      if (pago) {
        setPrecisaCadastro(user?.is_anonymous ?? true);
        setEstado("aprovado");
        return;
      }

      tentativasRef.current += 1;
      if (tentativasRef.current * INTERVALO_VERIFICACAO_MS >= TIMEOUT_TOTAL_MS) {
        setEstado("demorando");
        return;
      }
      timer = setTimeout(verificar, INTERVALO_VERIFICACAO_MS);
    };

    verificar();

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, []);

  const tentarDeNovo = () => {
    tentativasRef.current = 0;
    setEstado("verificando");
  };

  return (
    <div style={{ minHeight: "100dvh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: 22 }}>
          <BrandHeader />
        </div>

        {estado === "verificando" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid #2A4A40", borderTopColor: "#F0A15C", animation: "spin 0.9s linear infinite", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: "#F4EEE1", margin: "0 0 10px" }}>
              Confirmando seu pagamento
            </h1>
            <p style={{ color: "#9CB3A8", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
              Isso costuma levar só alguns segundos.
            </p>
          </>
        )}

        {estado === "aprovado" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={30} color="#8FBF9F" />
            </div>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, color: "#F4EEE1", margin: "0 0 10px" }}>
              Pagamento aprovado!
            </h1>
            <p style={{ color: "#9CB3A8", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 30px" }}>
              {precisaCadastro
                ? "Falta só criar sua conta pra garantir o acesso ao seu plano completo, mesmo se trocar de aparelho."
                : "Seu plano completo já está liberado."}
            </p>
            <Link
              href={precisaCadastro ? "/conta" : "/avaliacao"}
              style={{
                display: "block", width: "100%", padding: "17px 20px", borderRadius: 14,
                background: "linear-gradient(135deg, #F0A15C, #E8785A)", color: "#1B140D",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15.5,
                textDecoration: "none", boxShadow: "0 8px 20px -8px rgba(232,120,90,0.6)",
              }}
            >
              {precisaCadastro ? "Criar minha conta" : "Ver meu plano completo"}
            </Link>
          </>
        )}

        {estado === "demorando" && (
          <>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: "#F4EEE1", margin: "0 0 10px" }}>
              Ainda não recebemos a confirmação
            </h1>
            <p style={{ color: "#9CB3A8", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              Às vezes a confirmação demora um pouco mais. Se você já pagou, tente de novo em instantes.
            </p>
            <button
              onClick={tentarDeNovo}
              style={{
                width: "100%", padding: "17px 20px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #F0A15C, #E8785A)", color: "#1B140D",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15.5,
              }}
            >
              Verificar novamente
            </button>
          </>
        )}
      </div>
      </main>
      <PageFooter />
    </div>
  );
}
