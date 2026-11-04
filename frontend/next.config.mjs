/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un servidor mínimo para la imagen de Docker.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
