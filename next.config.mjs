/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // GitHub Pages için statik HTML çıktısı
  basePath: process.env.NODE_ENV === 'production' ? '/adisyon-uygulamasi' : '', // GitHub Pages için base path
  images: {
    unoptimized: true, // GitHub Pages için gerekli
  },
  reactStrictMode: true,
};

export default nextConfig; 