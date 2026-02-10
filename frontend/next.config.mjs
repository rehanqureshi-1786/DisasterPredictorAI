/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/predict',
        destination: 'http://127.0.0.1:5000/predict',
      },
      {
        source: '/recent-predictions',
        destination: 'http://127.0.0.1:5000/recent-predictions',
      },
      {
        source: '/weather-trends',
        destination: 'http://127.0.0.1:5000/weather-trends',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://127.0.0.1:5000/api/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
