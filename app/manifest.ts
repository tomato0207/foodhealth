import type { MetadataRoute } from "next";

// Web App Manifest — makes the site installable and is what Bubblewrap reads to build the Android (TWA) app
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "營養管家",
    short_name: "營養管家",
    description: "個人化營養素追蹤與 AI 拍照估算",
    lang: "zh-Hant",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
