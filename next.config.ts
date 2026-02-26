import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/bin-xray" : "",
  assetPrefix: isProd ? "/bin-xray/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
