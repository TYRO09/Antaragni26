const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

const corsHeaders = [
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true'
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: 'https://ca.antaragni.in' // Replace with your production domain
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Apply strict CORS to API routes
        source: '/api/:path*',
        headers: corsHeaders,
      }
    ];
  },
};

export default nextConfig;
