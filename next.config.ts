import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // site estático para o Netlify (pasta out/)
  images: { unoptimized: true }, // as imagens já saem otimizadas (AVIF/WebP) de scripts/otimizar-imagens.mjs
  trailingSlash: true,
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
