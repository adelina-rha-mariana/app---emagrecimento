import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vixofit, mais vida em você",
    short_name: "Vixofit",
    description: "Vixofit, emagreça com saúde, no seu ritmo.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1512",
    theme_color: "#0B1512",
    icons: [
      {
        src: "/icons/v-mais-folha.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/v-isolado.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
