"use client";

import Script from "next/script";

// Widget oficial do governo (vlibras.gov.br) que traduz o conteúdo da
// página pra Libras — acessibilidade pra usuários surdos. Renderizado uma
// vez no layout raiz, então aparece flutuando em todas as páginas do app.
declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

const vwRootProps: Record<string, string> = { vw: "" };
const vwButtonProps: Record<string, string> = { "vw-access-button": "" };
const vwWrapperProps: Record<string, string> = { "vw-plugin-wrapper": "" };

export default function VLibrasWidget() {
  return (
    <>
      <div {...vwRootProps} className="enabled">
        <div {...vwButtonProps} className="active" />
        <div {...vwWrapperProps}>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app");
        }}
      />
    </>
  );
}
