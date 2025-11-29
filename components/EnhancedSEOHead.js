/**
 * Enhanced SEO Head Component
 * Wrapper component kết hợp SEOOptimized và MultiSearchEngineOptimizer
 * Sử dụng cho tất cả pages
 */

import SEOOptimized from './SEOOptimized';
import MultiSearchEngineOptimizer from './MultiSearchEngineOptimizer';
import { memo } from 'react';

const EnhancedSEOHead = memo(function EnhancedSEOHead({
    pageType = 'home',
    customTitle,
    customDescription,
    customKeywords,
    canonicalUrl,
    ogImage,
    breadcrumbs,
    faq,
    structuredData = [],
    locale = 'vi_VN',
    author = 'Dàn Đề Wukong',
    // Backward compatibility: support both 'title' and 'customTitle'
    title,
    description,
    keywords,
    canonical,
}) {
    // Support both old prop names (title, description, keywords, canonical) and new ones (customTitle, etc.)
    const finalTitle = customTitle || title;
    const finalDescription = customDescription || description;
    const finalKeywords = customKeywords || keywords;
    const finalCanonical = canonicalUrl || canonical;
    return (
        <>
            {/* ✅ SEOOptimized - Existing SEO component */}
            <SEOOptimized
                pageType={pageType}
                customTitle={finalTitle}
                customDescription={finalDescription}
                customKeywords={finalKeywords}
                canonicalUrl={finalCanonical}
                ogImage={ogImage}
                breadcrumbs={breadcrumbs}
                faq={faq}
                structuredData={structuredData}
            />

            {/* ✅ MultiSearchEngineOptimizer - Enhanced for Bing, Cốc Cốc */}
            <MultiSearchEngineOptimizer
                title={finalTitle}
                description={finalDescription}
                keywords={finalKeywords}
                url={finalCanonical}
                image={ogImage}
                locale={locale}
                type={pageType === 'home' ? 'website' : 'article'}
                author={author}
                structuredData={structuredData}
            />
        </>
    );
});

export default EnhancedSEOHead;












