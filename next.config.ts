import type { NextConfig } from "next";

// GitHub Pages deploys this repo at https://021hk.github.io/math-ops-wheel/
const BASE_PATH = "/math-ops-wheel";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Static export so the site can be served by GitHub Pages
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
