// Link de compartilhamento simples do "indicar para uma amiga": por enquanto
// é só a URL pública do app (sem rastreamento de indicação), acompanhada de
// uma mensagem pronta pra colar/enviar.

export function buildShareLink() {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const mensagem = "Comecei a cuidar da minha alimentação com esse app e lembrei de você 💛 Dá uma olhada:";
  return { url, mensagem };
}

// Copia texto pra área de transferência com fallback para navegadores/contextos
// sem suporte à Clipboard API (ex: fora de HTTPS).
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // cai pro fallback abaixo
    }
  }
  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
