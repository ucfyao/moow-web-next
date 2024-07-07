/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config.js');

module.exports = {
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
