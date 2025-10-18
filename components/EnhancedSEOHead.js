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
    structuredData,
    locale = 'vi_VN',
    author = 'Dàn Đề Wukong',
}) {
    return (
        <>
            {/* ✅ SEOOptimized - Existing SEO component */}
            <SEOOptimized
                pageType={pageType}
                customTitle={customTitle}
                customDescription={customDescription}
                customKeywords={customKeywords}
                canonicalUrl={canonicalUrl}
                ogImage={ogImage}
                breadcrumbs={breadcrumbs}
                faq={faq}
                structuredData={structuredData}
            />

            {/* ✅ MultiSearchEngineOptimizer - Enhanced for Bing, Cốc Cốc */}
            <MultiSearchEngineOptimizer
                title={customTitle}
                description={customDescription}
                keywords={customKeywords}
                url={canonicalUrl}
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








