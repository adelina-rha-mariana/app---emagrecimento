import Image from "next/image";
import logoCompleta from "@/assets/logo-vixofit/1-logo-completa.png";
import vMaisFolha from "@/assets/logo-vixofit/2-v-mais-folha.png";

// Logo completa (símbolo + "VIXOFIT MAIS VIDA EM VOCÊ"), usada na tela de
// abertura do app e em telas de apresentação/boas-vindas.
export function LogoCompleta({ width = 220 }: { width?: number }) {
  return (
    <Image
      src={logoCompleta}
      alt="Vixofit, mais vida em você"
      width={width}
      height={width}
      style={{ width, height: "auto" }}
      priority
    />
  );
}

// Cabeçalho de marca (símbolo colorido + wordmark) usado no topo de todas as
// telas do app, no lugar do antigo texto solto "VIXOFIT".
export function BrandHeader({ compact }: { compact?: boolean }) {
  const size = compact ? 20 : 26;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Image src={vMaisFolha} alt="" width={size} height={size} style={{ width: size, height: size, flexShrink: 0 }} />
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: compact ? 13 : 14, color: "#F0A15C", letterSpacing: 3 }}>
        VIXOFIT
      </span>
    </div>
  );
}
