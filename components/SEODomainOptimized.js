import Head from 'next/head';

export default function SEODomainOptimized({
  title = 'Tạo Dàn Đề Wukong - Công Cụ Chuyên Nghiệp',
  description = 'Công cụ tạo dàn đề và thống kê xổ số 3 miền chuyên nghiệp - Thương hiệu Wukong. Miễn phí, nhanh chóng, chính xác 100%.',
  keywords = 'tạo dàn đề, thống kê xổ số, 3 miền, lô số, dàn 2D, dàn 3D, dàn 4D, Wukong',
  canonical = '',
  ogImage = '/og-image.png',
  noindex = false
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
  const fullUrl = canonical || siteUrl;
  const fullImageUrl = `${siteUrl}${ogImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Dàn Đề Wukong" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <meta name="googlebot" content="index,follow" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//api.taodandewukong.pro" />

      {/* Preconnect for Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://api.taodandewukong.pro" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Tạo Dàn Đề Wukong" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@taodandewukong" />
      <meta name="twitter:creator" content="@taodandewukong" />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Tạo Dàn Đề" />

      {/* Theme Color */}
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Performance Hints */}
      <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
      <meta name="preload" content="true" />

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon-192.png" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Tạo Dàn Đề Wukong',
            alternateName: 'Dàn Đề Online',
            description: description,
            url: siteUrl,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            softwareVersion: '1.0.0',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'VND',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1547',
              bestRating: '5',
              worstRating: '1',
            },
            author: {
              '@type': 'Organization',
              name: 'Dàn Đề Wukong',
              url: siteUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Dàn Đề Wukong',
              logo: {
                '@type': 'ImageObject',
                url: fullImageUrl,
              },
            },
            image: {
              '@type': 'ImageObject',
              url: fullImageUrl,
              width: 1200,
              height: 630,
            },
            inLanguage: 'vi-VN',
            potentialAction: {
              '@type': 'UseAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: siteUrl,
              },
            },
          }),
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Dàn Đề Wukong',
            url: siteUrl,
            logo: fullImageUrl,
            description: 'Bộ công cụ tạo dàn đề chuyên nghiệp: 2D, 3D, 4D, Đặc Biệt. Miễn phí, nhanh chóng, chính xác.',
            sameAs: [
              'https://www.facebook.com/taodandewukong',
              'https://t.me/taodandewukong',
              'https://zalo.me/taodandewukong',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              availableLanguage: ['Vietnamese'],
            },
          }),
        }}
      />
    </Head>
  );
}
