/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Basic optimizations
    compress: true,
    poweredByHeader: false,

    // ✅ Performance: Only transpile packages that need it
    // lucide-react is ESM and doesn't need transpilation for modern browsers
    transpilePackages: [],

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
        
        // ✅ Performance: Advanced bundle splitting to reduce unused code
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                // ✅ Note: usedExports is enabled by default in Next.js
                // Don't set it explicitly to avoid conflicts with cacheUnaffected
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000, // Only split chunks larger than 20KB
                    maxSize: 244000, // Max chunk size ~244KB
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Large libraries that should be split separately
                        framework: {
                            name: 'framework',
                            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|object-assign)[\\/]/,
                            priority: 40,
                            reuseExistingChunk: true,
                        },
                        // UI libraries
                        ui: {
                            name: 'ui',
                            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
                            priority: 30,
                            reuseExistingChunk: true,
                        },
                        // Utility libraries
                        utils: {
                            name: 'utils',
                            test: /[\\/]node_modules[\\/](lodash|moment|axios|debounce)[\\/]/,
                            priority: 25,
                            reuseExistingChunk: true,
                        },
                        // Other vendor libraries
                        vendor: {
                            name: 'vendor',
                            test: /[\\/]node_modules[\\/]/,
                            priority: 20,
                            reuseExistingChunk: true,
                            minChunks: 2, // Only include if used in 2+ chunks
                        },
                        // Common chunk for shared code (smaller threshold)
                        common: {
                            name: 'common',
                            minChunks: 3, // Increased from 2 to reduce unused code
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true, // Force creation even if small
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
    // This reduces bundle size by ~14 KiB
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
    
    // ✅ Performance: Experimental features for better optimization
    experimental: {
        optimizeCss: true, // Enable CSS optimization (removes unused CSS)
        optimizePackageImports: [
            'lucide-react', // Tree shake lucide-react icons
            'lodash', // Tree shake lodash functions
        ],
    },
    
    // ✅ Performance: Optimize CSS output
    // Next.js automatically removes unused CSS in production builds
    // This is handled by the CSS optimization in experimental.optimizeCss
    // Note: SWC minification is enabled by default in Next.js 15
};

module.exports = nextConfig;