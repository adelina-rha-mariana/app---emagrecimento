"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BrandHeader } from "@/app/components/Logo";
import PageFooter from "@/app/components/PageFooter";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');";

type Modo = "entrar" | "criar";
// fechado | pedir-codigo (digitou email, esperando o código chegar) | redefinir (código + nova senha)
type EtapaSenha = "fechado" | "pedir-codigo" | "redefinir";

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

const codigoInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontSize: 22,
  letterSpacing: 6,
  textAlign: "center",
  fontFamily: "Fraunces, serif",
};

// Não fixamos um tamanho exato: quem gera o código é o Supabase (server-side),
// não este app — validar/limitar por um número de dígitos específico aqui
// quebraria a confirmação se o tamanho do código mudar do lado deles.
const CODIGO_MIN_LENGTH = 4;

// Campo de senha com botão de mostrar/ocultar — ajuda quem tem menos prática
// com tecnologia a conferir o que digitou antes de confirmar.
function PasswordInput({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visivel ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 44 }}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        onClick={() => setVisivel(!visivel)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        style={{
          position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", padding: 10,
          display: "flex", alignItems: "center", color: "#9CB3A8",
        }}
      >
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function ContaPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("criar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Confirmação de cadastro por código numérico (em vez de link — links de
  // confirmação são "clicados" por scanners de segurança de alguns provedores
  // de email antes da pessoa mesma clicar, o que invalida o token).
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [codigoReenviado, setCodigoReenviado] = useState(false);

  // Esqueci minha senha — mesma lógica de código, sem depender de link.
  const [etapaSenha, setEtapaSenha] = useState<EtapaSenha>("fechado");
  const [codigoSenha, setCodigoSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const submeter = async () => {
    setErro(null);
    if (!email.trim() || !senha) {
      setErro("Preencha email e senha.");
      return;
    }
    setCarregando(true);

    if (modo === "criar") {
      const nomeTrim = nome.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: nomeTrim ? { data: { nome: nomeTrim } } : undefined,
      });
      setCarregando(false);
      if (error) {
        setErro(error.message);
        return;
      }
      if (!data.session) {
        // Confirmação de email habilitada no projeto: ainda não há sessão até confirmar o código.
        setAguardandoConfirmacao(true);
        return;
      }
      router.push("/avaliacao");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        // Conta criada mas nunca confirmada — manda direto pra tela de código em vez de um erro genérico.
        await supabase.auth.resend({ type: "signup", email: email.trim() });
        setAguardandoConfirmacao(true);
        return;
      }
      setErro("Email ou senha incorretos.");
      return;
    }
    router.push("/avaliacao");
  };

  const confirmarCadastro = async () => {
    setErro(null);
    if (codigoConfirmacao.trim().length < CODIGO_MIN_LENGTH) {
      setErro("Digite o código que mandamos pro seu email.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: codigoConfirmacao.trim(),
      type: "signup",
    });
    setCarregando(false);
    if (error) {
      setErro(`${error.message} (código: ${error.code ?? error.status ?? "?"})`);
      return;
    }
    router.push("/avaliacao");
  };

  const reenviarCodigoCadastro = async () => {
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setCodigoReenviado(true);
    setTimeout(() => setCodigoReenviado(false), 4000);
  };

  const pedirCodigoSenha = async () => {
    setErro(null);
    if (!email.trim()) {
      setErro("Digite seu email pra receber o código.");
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
    setEtapaSenha("redefinir");
  };

  const redefinirComCodigo = async () => {
    setErro(null);
    if (codigoSenha.trim().length < CODIGO_MIN_LENGTH) {
      setErro("Digite o código que mandamos pro seu email.");
      return;
    }
    if (novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: codigoSenha.trim(),
      type: "recovery",
    });
    if (verifyError) {
      setCarregando(false);
      setErro(`${verifyError.message} (código: ${verifyError.code ?? verifyError.status ?? "?"})`);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
    setCarregando(false);
    if (updateError) {
      setErro(updateError.message);
      return;
    }
    router.push("/avaliacao");
  };

  const fecharFluxoSenha = () => {
    setEtapaSenha("fechado");
    setCodigoSenha("");
    setNovaSenha("");
    setErro(null);
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
            {etapaSenha !== "fechado" ? (
              etapaSenha === "pedir-codigo" ? (
                <>
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 6px" }}>
                    Esqueceu sua senha?
                  </h1>
                  <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
                    Digite o email da sua conta e mandamos um código pra você criar uma senha nova.
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
                    onClick={pedirCodigoSenha}
                    disabled={carregando}
                    style={{
                      width: "100%", marginTop: 18, padding: "15px 20px", borderRadius: 14, border: "none",
                      background: carregando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
                      color: carregando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
                      fontSize: 14.5, cursor: carregando ? "not-allowed" : "pointer",
                    }}
                  >
                    {carregando ? "Enviando..." : "Enviar código"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <button
                      onClick={fecharFluxoSenha}
                      style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 13, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <KeyRound size={26} color="#F0A15C" style={{ marginBottom: 10 }} />
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 6px" }}>
                    Digite o código e a nova senha
                  </h1>
                  <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
                    Mandamos um código pra <strong style={{ color: "#F4EEE1" }}>{email}</strong>.
                  </p>

                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>CÓDIGO</label>
                  <input
                    type="text" inputMode="numeric" maxLength={10} value={codigoSenha}
                    onChange={(e) => setCodigoSenha(e.target.value.replace(/\D/g, ""))}
                    placeholder="Digite o código" style={codigoInputStyle}
                  />

                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, margin: "14px 0 6px" }}>NOVA SENHA</label>
                  <PasswordInput
                    value={novaSenha} onChange={setNovaSenha}
                    placeholder="Mínimo 6 caracteres"
                    onKeyDown={(e) => e.key === "Enter" && redefinirComCodigo()}
                  />

                  {erro && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                      <AlertCircle size={15} color="#E8785A" />
                      <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>{erro}</span>
                    </div>
                  )}

                  <button
                    onClick={redefinirComCodigo}
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
                  <div style={{ textAlign: "center", marginTop: 14, display: "flex", justifyContent: "center", gap: 16 }}>
                    <button
                      onClick={pedirCodigoSenha}
                      disabled={carregando}
                      style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}
                    >
                      Reenviar código
                    </button>
                    <button
                      onClick={fecharFluxoSenha}
                      style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )
            ) : aguardandoConfirmacao ? (
              <>
                <KeyRound size={26} color="#F0A15C" style={{ marginBottom: 10 }} />
                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#F4EEE1", margin: "0 0 6px" }}>
                  Confirme seu email
                </h1>
                <p style={{ color: "#9CB3A8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
                  Mandamos um código pra <strong style={{ color: "#F4EEE1" }}>{email}</strong>. Digite abaixo pra ativar sua conta.
                </p>

                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>CÓDIGO</label>
                <input
                  type="text" inputMode="numeric" maxLength={10} value={codigoConfirmacao}
                  onChange={(e) => setCodigoConfirmacao(e.target.value.replace(/\D/g, ""))}
                  placeholder="Digite o código" style={codigoInputStyle}
                  onKeyDown={(e) => e.key === "Enter" && confirmarCadastro()}
                />

                {erro && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                    <AlertCircle size={15} color="#E8785A" />
                    <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>{erro}</span>
                  </div>
                )}
                {codigoReenviado && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                    <CheckCircle2 size={15} color="#8FBF9F" />
                    <span style={{ color: "#F4EEE1", fontSize: 12.5 }}>Código reenviado.</span>
                  </div>
                )}

                <button
                  onClick={confirmarCadastro}
                  disabled={carregando}
                  style={{
                    width: "100%", marginTop: 18, padding: "15px 20px", borderRadius: 14, border: "none",
                    background: carregando ? "#3A3F3A" : "linear-gradient(135deg, #F0A15C, #E8785A)",
                    color: carregando ? "#7A8079" : "#1B140D", fontFamily: "Inter, sans-serif", fontWeight: 700,
                    fontSize: 14.5, cursor: carregando ? "not-allowed" : "pointer",
                  }}
                >
                  {carregando ? "Confirmando..." : "Confirmar e continuar"}
                </button>
                <div style={{ textAlign: "center", marginTop: 14, display: "flex", justifyContent: "center", gap: 16 }}>
                  <button
                    onClick={reenviarCodigoCadastro}
                    disabled={carregando}
                    style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Reenviar código
                  </button>
                  <button
                    onClick={() => { setAguardandoConfirmacao(false); setCodigoConfirmacao(""); setErro(null); }}
                    style={{ background: "none", border: "none", color: "#9CB3A8", fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Voltar
                  </button>
                </div>
              </>
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
                    ? "Sua conta salva suas respostas, seu plano e sua evolução. Sem ela, tudo se perde ao fechar o app."
                    : "Entre pra continuar de onde parou."}
                </p>

                <div style={{ display: "grid", gap: 12 }}>
                  {modo === "criar" && (
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>NOME (OPCIONAL)</label>
                      <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>EMAIL</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CB3A8", letterSpacing: 0.4, marginBottom: 6 }}>SENHA</label>
                    <PasswordInput
                      value={senha} onChange={setSenha}
                      placeholder={modo === "criar" ? "Mínimo 6 caracteres" : "Sua senha"}
                      onKeyDown={(e) => e.key === "Enter" && submeter()}
                    />
                  </div>
                </div>

                {modo === "entrar" && (
                  <div style={{ textAlign: "right", marginTop: 10 }}>
                    <button
                      onClick={() => { setEtapaSenha("pedir-codigo"); setErro(null); }}
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
