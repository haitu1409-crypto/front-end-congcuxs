const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

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

    // ✅ Optimize for development - fix router abort errors
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 120 * 1000, // Tăng lên 120s để tránh abort
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 10, // Tăng lên 10 để tránh abort
    },

    // ✅ Fix router abort errors
    async rewrites() {
        return [
            // Handle dynamic routes properly
            {
                source: '/thong-ke',
                destination: '/thong-ke',
            },
            {
                source: '/dan-dac-biet',
                destination: '/dan-dac-biet',
            },
        ];
    },

    // Tối ưu hóa images cho PageSpeed
    images: {
        domains: ['localhost', 'api.taodandewukong.pro'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api.taodandewukong.pro',
                pathname: '/uploads/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // 1 year cache
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        unoptimized: false, // Enable optimization
        loader: 'default', // Use Next.js optimized loader
    },

    // i18n cho SEO đa ngôn ngữ (tạm thời disable để fix build)
    // i18n: {
    //     locales: ['vi', 'en'],
    //     defaultLocale: 'vi',
    // },

    // Headers cho SEO và security - CRITICAL
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // DNS Prefetch for SEO optimization
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    // Custom Domain Support & Security Headers
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
                ],
            },
            // Fix MIME types for JavaScript files
            {
                source: '/_next/static/chunks/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8'
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ],
            },
            // Fix MIME types for CSS files
            {
                source: '/_next/static/css/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/css; charset=utf-8'
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ],
            },
            // Handle Chrome DevTools requests
            {
                source: '/.well-known/appspecific/com.chrome.devtools.json',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/json'
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate'
                    }
                ],
            },
            // Handle source maps requests - Fixed 404 errors
            {
                source: '/_next/static/chunks/:path*.js.map',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate'
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/json'
                    }
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
                    {
                        key: 'Content-Type',
                        value: 'font/woff2'
                    },
                ],
            },
            // Fix font 404 errors - handle woff2 files
            {
                source: '/:path*.woff2',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                    {
                        key: 'Content-Type',
                        value: 'font/woff2'
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
            // Redirect old FAQ page to new Content page
            {
                source: '/faq',
                destination: '/content',
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
        // ✅ Use eval-source-map for development (Next.js default)
        if (dev) {
            config.devtool = 'eval-source-map';
        }

        // Development optimizations
        if (dev) {
            // Faster rebuilds in development
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
                ignored: /node_modules/,
            };

            // Fix development overlay issues
            config.resolve.alias = {
                ...config.resolve.alias,
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
                        // HTML2Canvas - Fixed chunk splitting
                        html2canvas: {
                            name: 'html2canvas',
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/]html2canvas[\\/]/,
                            priority: 30,
                            enforce: true,
                            reuseExistingChunk: true,
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
    generateEtags: false, // Disable ETags for better performance
    compress: true, // Enable compression


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
        // Disable source maps in development for faster builds
        webVitalsAttribution: ['CLS', 'LCP'],
        // Optimize package imports
        optimizePackageImports: ['lucide-react', 'html2canvas'],
        // PageSpeed optimizations
        esmExternals: true,
        serverMinification: true,
        // New optimizations for PageSpeed
        optimizeServerReact: true,
        serverSourceMaps: false,
        largePageDataBytes: 128 * 1000, // 128KB
    },

    // ✅ Bundle analyzer moved to withBundleAnalyzer wrapper

    // Compiler options
    compiler: {
        styledComponents: false,
    },
};

module.exports = withBundleAnalyzer(nextConfig);

