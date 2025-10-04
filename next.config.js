/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Tối ưu hóa hiệu suất - CRITICAL
    compress: true,
    poweredByHeader: false, // Remove X-Powered-By header for security

    // Enable static optimization
    trailingSlash: false,

    // Transpile packages for better performance
    transpilePackages: ['lucide-react'],

    // Optimize for development - tăng thời gian cache để tránh reload liên tục
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 60 * 1000, // Tăng từ 25s lên 60s
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 5, // Tăng từ 2 lên 5
    },

    // Tối ưu hóa images
    images: {
        domains: [],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    // i18n cho SEO đa ngôn ngữ (có thể mở rộng)
    i18n: {
        locales: ['vi', 'en'],
        defaultLocale: 'vi',
    },

    // Headers cho SEO và security - CRITICAL
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // DNS Prefetch
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    // Security Headers
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    // Permissions Policy
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    // Cache Control for better performance
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
            // Specific headers for static assets
            {
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
        ];
    },

    // Redirects cho SEO
    async redirects() {
        return [
            // Redirect www to non-www (hoặc ngược lại tùy preference)
            {
                source: '/home',
                destination: '/',
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

    // Webpack optimization - CRITICAL for performance
    webpack: (config, { dev, isServer }) => {
        // Development optimizations
        if (dev) {
            // Faster rebuilds in development
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
                ignored: /node_modules/,
            };

            // Skip type checking in development for faster builds
            config.resolve.alias = {
                ...config.resolve.alias,
                'react-dom$': 'react-dom/profiling',
                'scheduler/tracing': 'scheduler/tracing-profiling',
            };
        }

        // Optimize bundle splitting for both dev and production
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000,
                    maxSize: 244000,
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Framework bundle
                        framework: {
                            name: 'framework',
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                            priority: 40,
                            enforce: true,
                        },
                        // Lucide React icons
                        lucide: {
                            name: 'lucide',
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                            priority: 35,
                            enforce: true,
                        },
                        // HTML2Canvas
                        html2canvas: {
                            name: 'html2canvas',
                            chunks: 'async',
                            test: /[\\/]node_modules[\\/]html2canvas[\\/]/,
                            priority: 30,
                            enforce: true,
                        },
                        // Commons bundle
                        commons: {
                            name: 'commons',
                            chunks: 'all',
                            minChunks: 2,
                            priority: 20,
                        },
                        // Lib bundle
                        lib: {
                            test: /[\\/]node_modules[\\/]/,
                            name(module) {
                                const packageName = module.context.match(
                                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                                )[1];
                                return `lib.${packageName.replace('@', '')}`;
                            },
                            priority: 10,
                            minChunks: 1,
                            reuseExistingChunk: true,
                        },
                    },
                    maxInitialRequests: 25,
                },
            };
        }

        return config;
    },

    // Production optimizations
    productionBrowserSourceMaps: false,

    // Experimental features for better performance
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react'],
        // Optimize server components
        serverComponentsExternalPackages: ['axios'],
        // Enable turbo mode for faster builds
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
        // Optimize memory usage
        memoryBasedWorkersCount: true,
    },

    // Bundle analyzer (uncomment to analyze)
    // bundleAnalyzer: {
    //     enabled: process.env.ANALYZE === 'true',
    // },

    // Compiler options
    compiler: {
        styledComponents: false,
    },
};

module.exports = nextConfig;

