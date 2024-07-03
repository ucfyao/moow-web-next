/** @type {import('next').NextConfig} */
import { i18n } from './next-i18next.config.js';
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:3000/api/:path*', 
        },
      ];
    },
    i18n,
  };
  
  export default nextConfig;