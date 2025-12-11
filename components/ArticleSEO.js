import Head from 'next/head';

const ArticleSEO = ({
    title,
    description,
    author = 'Tạo Dàn Đề Wukong',
    publishedTime,
    modifiedTime,
    image,
    url,
    siteName = 'Tạo Dàn Đề Wukong - Chuyên gia Xổ Số',
    locale = 'vi_VN',
    type = 'article',
    keywords = [],
    category = '',
    tags = [],
    readingTime = '',
    canonical = ''
}) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const fullUrl = url || siteUrl;
    const canonicalUrl = canonical || fullUrl;
    // Ensure image URL is absolute and properly formatted
    let imageUrl = '';
    if (image) {
        if (image.startsWith('http://') || image.startsWith('https://')) {
            imageUrl = image;
        } else if (image.startsWith('/')) {
            imageUrl = `${siteUrl}${image}`;
        } else {
            imageUrl = `${siteUrl}/${image}`;
        }
    } else {
        imageUrl = `${siteUrl}/imgs/wukong.png`;
    }
    
    // Determine image type from URL extension
    const getImageType = (url) => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg';
        if (lowerUrl.includes('.png')) return 'image/png';
        if (lowerUrl.includes('.webp')) return 'image/webp';
        if (lowerUrl.includes('.gif')) return 'image/gif';
        return 'image/jpeg'; // Default to jpeg
    };
    
    const imageType = getImageType(imageUrl);
    
    // Format dates for schema
    const formattedPublishedTime = publishedTime ? new Date(publishedTime).toISOString() : new Date().toISOString();
    const formattedModifiedTime = modifiedTime ? new Date(modifiedTime).toISOString() : formattedPublishedTime;

    // JSON-LD Schema.org structured data
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: [imageUrl],
        datePublished: formattedPublishedTime,
        dateModified: formattedModifiedTime,
        author: {
            '@type': 'Person',
            name: author,
            url: siteUrl
        },
        publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': fullUrl
        },
        articleSection: category,
        keywords: keywords.join(', '),
        wordCount: description?.length || 0,
        inLanguage: 'vi-VN'
    };

    // BreadcrumbList schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Trang chủ',
                item: siteUrl
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Tin tức',
                item: `${siteUrl}/tin-tuc`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: title,
                item: fullUrl
            }
        ]
    };

    // WebSite schema
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/tin-tuc?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title} | {siteName}</title>
            <meta name="title" content={`${title} | ${siteName}`} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <meta name="author" content={author} />
            
            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:secure_url" content={imageUrl.replace('http://', 'https://')} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:image:type" content={imageType} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={locale} />
            <meta property="article:published_time" content={formattedPublishedTime} />
            <meta property="article:modified_time" content={formattedModifiedTime} />
            <meta property="article:author" content={author} />
            <meta property="article:section" content={category} />
            {tags.map((tag, index) => (
                <meta key={index} property="article:tag" content={tag} />
            ))}
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:creator" content="@taodande" />
            <meta name="twitter:site" content="@taodande" />
            
            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <meta name="bingbot" content="index, follow" />
            <meta name="language" content="Vietnamese" />
            <meta name="revisit-after" content="1 days" />
            <meta name="rating" content="general" />
            <meta name="distribution" content="global" />
            
            {/* Mobile Meta Tags */}
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            
            {/* Reading Time (if available) */}
            {readingTime && <meta name="twitter:label1" content="Thời gian đọc" />}
            {readingTime && <meta name="twitter:data1" content={readingTime} />}
            
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            
            {/* Preconnect to external domains for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            
            {/* Alternate Languages (if needed) */}
            <link rel="alternate" hrefLang="vi" href={fullUrl} />
            <link rel="alternate" hrefLang="x-default" href={fullUrl} />
        </Head>
    );
};

export default ArticleSEO;
