/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.quran.com',
                port: '',
                pathname: '/v4/chapters/**',
            },
            {
                protocol: 'https',
                hostname: 'quran.com',
                port: '',
                pathname: '/api/v4/chapters/**',
            },
        ],
    },
};

export default nextConfig;
