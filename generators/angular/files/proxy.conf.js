const PROXY_CONFIG = [
  {
    context: ['/api', '/auth'],
    target: 'http://localhost:2000',
    secure: false,
    changeOrigin: true,
  },
];

module.exports = PROXY_CONFIG;
