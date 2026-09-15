"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BrandHeader } from "@/app/components/Logo";
import PageFooter from "@/app/components/PageFooter";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #2A4A40",
  borderRadius: 10,
  padding: "13px 14px",
  fontSize: 14,
  background: "#1B302A",
  color: "#F4EEE1",
  fontFamily: "Inter, sans-serif",
};

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // O link do email troca o token de recuperação por uma sessão automaticamente
    // (supabase-js detecta o token na URL). Esperamos esse evento antes de liberar o form.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPronto(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const salvar = async () => {
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setSucesso(true);
    setTimeout(() => router.push("/avaliacao"), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0B1512", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #F0A15C !important; }
      `}</style>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div style={{ maxWidth: 400, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <BrandHeader />
          </div>

          <div style={{ background: "#1B302A", border: "1px solid #2A4A40", borderRadius: 20, padding: 24, textAlign: sucesso || !pronto ? "center" : "left" }}>
            {!pronto ? (
              <p style={{ color: "#9CB3A8", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                Confirmando seu link de recuperação...
              </p>
            ) : sucesso ? (
              <>
                <CheckCircle2 size={32} color="#8FBF9F" style={{ marginBottom: 12 }} />
                <p style={{ color: "#F4EEE1", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Senha atualizada! Te levando de volta pra avaliação...
                </p>
              </>
            ) : (
              <>
                <KeyRound size={26} color="#F0A15C" style={{ marginBottom: 10 }} />
                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 6px" }}>
                  Crie uma nova senha
                </h1>
                <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
                  Mínimo de 6 caracteres.
                </p>
                <input
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="Nova senha" style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && salvar()}
                />

                {erro && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                    <AlertCircle size={15} color="#E8785A" />
                    <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>{erro}</span>
                  </div>
                )}

                <button
                  onClick={salvar}
                  disabled={carregando}
                  style={{
                    width: "100%", marginTop: 18, padding: "15px 20px", borderRadius: 14, border: "none",
                    background: carregando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
                    color: carregando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
                    fontSize: 14.5, cursor: carregando ? "not-allowed" : "pointer",
                  }}
                >
                  {carregando ? "Salvando..." : "Salvar nova senha"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
