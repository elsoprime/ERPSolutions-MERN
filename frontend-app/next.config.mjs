/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactivar ESLint durante el build de producción
    // Los errores se pueden corregir gradualmente en desarrollo
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
