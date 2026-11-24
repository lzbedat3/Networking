import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // the tutor route reads these files at runtime, so they must be bundled with the serverless function
  outputFileTracingIncludes: {
    "/api/tutor": ["./knowledge/**/*", "./public/exam/**/*"],
  },
};

export default nextConfig;
