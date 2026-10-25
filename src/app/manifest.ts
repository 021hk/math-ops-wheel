import type { MetadataRoute } from "next";

// Required for "output: export" (static export)
export const dynamic = "force-static";

// Must match basePath in next.config.ts (GitHub Pages sub-path hosting)
const BASE = "/math-ops-wheel";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "گردونه عملیات ریاضی",
    short_name: "گردونه ریاضی",
    description:
      "بازی گروهی گردونه شانسی: در هر گردش، عمل اصلی ریاضی (جمع، تفریق، ضرب، تقسیم) تیمِ نوبت مشخص می‌شود — بدون طرح سوال.",
    lang: "fa",
    dir: "rtl",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffbeb",
    theme_color: "#fbbf24",
    categories: ["games", "education"],
    icons: [
      {
        src: `${BASE}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BASE}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BASE}/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
