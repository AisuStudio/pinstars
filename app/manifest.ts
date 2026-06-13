import type { MetadataRoute } from "next";

// PWA manifest — macht Pinstars „zum Home-Bildschirm hinzufügbar", damit der
// Spiele-Link auch nach Browser-Schließen über das App-Icon wiederkommt (#259).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pinstars",
    short_name: "Pinstars",
    description: "Die Geocaching-Schnitzeljagd für den Geburtstag.",
    start_url: "/",
    display: "standalone",
    background_color: "#0255cf",
    theme_color: "#0255cf",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
