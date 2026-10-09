/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'cdn.freesound.org', 'api.jamendo.com'],
  },
}

module.exports = nextConfig
