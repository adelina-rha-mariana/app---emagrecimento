"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BrandHeader } from "@/app/components/Logo";
import PageFooter from "@/app/components/PageFooter";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

type Modo = "entrar" | "criar";

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

export default function ContaPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("criar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmeEmail, setConfirmeEmail] = useState(false);
  const [esqueciSenha, setEsqueciSenha] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  const submeter = async () => {
    setErro(null);
    if (!email.trim() || !senha) {
      setErro("Preencha email e senha.");
      return;
    }
    setCarregando(true);

    if (modo === "criar") {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha });
      setCarregando(false);
      if (error) {
        setErro(error.message);
        return;
      }
      if (!data.session) {
        // Confirmação de email habilitada no projeto: ainda não há sessão.
        setConfirmeEmail(true);
        return;
      }
      router.push("/avaliacao");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      setErro("Email ou senha incorretos.");
      return;
    }
    router.push("/avaliacao");
  };

  const enviarLinkRecuperacao = async () => {
    setErro(null);
    if (!email.trim()) {
      setErro("Digite seu email pra receber o link.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/conta/redefinir-senha`,
    });
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setLinkEnviado(true);
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

          <div style={{ background: "#1B302A", border: "1px solid #2A4A40", borderRadius: 20, padding: 24 }}>
            {esqueciSenha ? (
              linkEnviado ? (
                <div style={{ textAlign: "center" }}>
                  <CheckCircle2 size={32} color="#8FBF9F" style={{ marginBottom: 12 }} />
                  <p style={{ color: "#F4EEE1", fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>
                    Se esse email tiver uma conta, enviamos um link pra você redefinir a senha.
                  </p>
                  <button
                    onClick={() => { setEsqueciSenha(false); setLinkEnviado(false); }}
                    style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 13, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <>
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 6px" }}>
                    Esqueceu sua senha?
                  </h1>
                  <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
                    Digite o email da sua conta e mandamos um link pra você criar uma senha nova.
                  </p>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />

                  {erro && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                      <AlertCircle size={15} color="#E8785A" />
                      <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>{erro}</span>
                    </div>
                  )}

                  <button
                    onClick={enviarLinkRecuperacao}
                    disabled={carregando}
                    style={{
                      width: "100%", marginTop: 18, padding: "15px 20px", borderRadius: 14, border: "none",
                      background: carregando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
                      color: carregando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
                      fontSize: 14.5, cursor: carregando ? "not-allowed" : "pointer",
                    }}
                  >
                    {carregando ? "Enviando..." : "Enviar link"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <button
                      onClick={() => setEsqueciSenha(false)}
                      style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 13, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )
            ) : confirmeEmail ? (
              <div style={{ textAlign: "center" }}>
                <Mail size={32} color="#F0A15C" style={{ marginBottom: 12 }} />
                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 8px" }}>
                  Confirme seu email
                </h1>
                <p style={{ color: "#9CB3A8", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                  Mandamos um link de confirmação para <strong style={{ color: "#F4EEE1" }}>{email}</strong>.
                  Toque nele pra ativar sua conta e continuar sua avaliação.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#12211D", borderRadius: 12, padding: 4 }}>
                  {(["criar", "entrar"] as Modo[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setModo(m); setErro(null); }}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer",
                        background: modo === m ? "#1B302A" : "transparent",
                        color: modo === m ? "#F0A15C" : "#9CB3A8",
                        fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
                      }}
                    >
                      {m === "criar" ? "Criar conta" : "Entrar"}
                    </button>
                  ))}
                </div>

                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 4px" }}>
                  {modo === "criar" ? "Vamos guardar seu progresso" : "Que bom te ver de novo"}
                </h1>
                <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 20px" }}>
                  {modo === "criar"
                    ? "Sua conta salva suas respostas, seu plano e sua evolução — sem ela, tudo se perde ao fechar o app."
                    : "Entre pra continuar de onde parou."}
                </p>

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>EMAIL</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>SENHA</label>
                    <input
                      type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                      placeholder={modo === "criar" ? "Mínimo 6 caracteres" : "Sua senha"}
                      style={inputStyle}
                      onKeyDown={(e) => e.key === "Enter" && submeter()}
                    />
                  </div>
                </div>

                {modo === "entrar" && (
                  <div style={{ textAlign: "right", marginTop: 10 }}>
                    <button
                      onClick={() => { setEsqueciSenha(true); setErro(null); }}
                      style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                {erro && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
                    <AlertCircle size={15} color="#E8785A" />
                    <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>{erro}</span>
                  </div>
                )}

                <div style={{ marginTop: modo === "entrar" ? 8 : 20 }}>
                  <button
                    onClick={submeter}
                    disabled={carregando}
                    style={{
                      width: "100%", padding: "16px 20px", borderRadius: 14, border: "none",
                      background: carregando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
                      color: carregando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
                      fontSize: 15, cursor: carregando ? "not-allowed" : "pointer",
                    }}
                  >
                    {carregando ? "Um momento..." : modo === "criar" ? "Criar conta e continuar" : "Entrar"}
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, color: "#6E7A73", fontSize: 11 }}>
                  <Lock size={12} />
                  <span>Seus dados ficam protegidos e só você acessa sua avaliação.</span>
                </div>
              </>
            )}
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
