/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // GitHub Pages için statik HTML çıktısı
  basePath: process.env.NODE_ENV === 'production' ? '/adisyoonqr' : '', // GitHub Pages için base path
  images: {
    unoptimized: true, // GitHub Pages için gerekli
  },
  reactStrictMode: true,
  trailingSlash: true, // URL sonunda / olmasını sağlar
};

export default nextConfig; 