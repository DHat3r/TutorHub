/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un servidor mínimo para la imagen de Docker.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
