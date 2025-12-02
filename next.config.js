/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Basic optimizations
    compress: true,
    poweredByHeader: false,

    // Transpile packages for better performance
    transpilePackages: ['lucide-react'],

    // Images configuration
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api1.taodandewukong.pro',
                pathname: '/uploads/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 500, 600, 700],
        minimumCacheTTL: 31536000,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        unoptimized: false,
        loader: 'default',
    },

    // Basic headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ],
            },
        ];
    },

    // Rewrites - Map clean URLs to actual page files
    async rewrites() {
        return [
            {
                source: '/ket-qua-xo-so-mien-bac',
                destination: '/kqxs',
            },
        ];
    },

    // Basic redirects
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/kqxs',
                destination: '/ket-qua-xo-so-mien-bac',
                permanent: true,
            },
        ];
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Tạo Dàn Đề',
    },

    // Simplified webpack config
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            config.devtool = 'eval-source-map';
        }
        
        // ✅ Performance: Optimize bundle splitting
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Vendor chunk for large libraries
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /node_modules/,
                            priority: 20,
                        },
                        // Common chunk for shared code
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                        },
                    },
                },
            };
        }
        
        return config;
    },

    // Production optimizations
    productionBrowserSourceMaps: false,
    generateEtags: false,
    compress: true,
    
    // ✅ Performance: Target modern browsers only (remove legacy polyfills)
    // This reduces bundle size by ~13 KiB
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
};

module.exports = nextConfig;