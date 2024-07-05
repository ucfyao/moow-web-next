/** @type {import('next').NextConfig} */
import { i18n } from './next-i18next.config.js';
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:3000/api/:path*',
        },
      ];
    } else {
      return [];
    }
  },
  i18n,
};
  
export default nextConfig;
