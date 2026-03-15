import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // @react-pdf/renderer is client-only (always used inside dynamic({ ssr: false })).
  // Mark as server-external so Next.js doesn't attempt to bundle it for RSC.
  // transpilePackages would conflict with serverExternalPackages in Turbopack.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
