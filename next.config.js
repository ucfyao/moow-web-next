const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:3000/api/:path*',
        },
      ];
    }
  },
};
