const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA precache while private gate is active (prevents offline leak of full app).
  disable:
    process.env.NODE_ENV === 'development' ||
    process.env.PRIVATE_MODE === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.PRIVATE_MODE !== 'false'),
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  outputFileTracingRoot: __dirname,
};

module.exports = withPWA(nextConfig);
