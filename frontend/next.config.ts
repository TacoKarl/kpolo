import type { NextConfig } from "next";


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/graphql", destination: `${backendUrl}/graphql` },
      { source: "/refresh", destination: `${backendUrl}/refresh` },
      { source: "/logout", destination: `${backendUrl}/logout` },
      { source: "/auth/login", destination: `${backendUrl}/auth/login` },
      { source: "/auth/register", destination: `${backendUrl}/auth/register` },
    ];
  },
};
export default nextConfig;
