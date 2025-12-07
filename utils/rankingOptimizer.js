/**
 * Ranking Optimizer Utilities
 * Các công cụ và functions hỗ trợ tối ưu ranking
 */

/**
 * Calculate keyword density in text
 * @param {string} text - Text content
 * @param {string} keyword - Target keyword
 * @returns {number} - Keyword density percentage
 */
export function calculateKeywordDensity(text, keyword) {
    if (!text || !keyword) return 0;

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    const words = lowerText.split(/\s+/);
    const keywordMatches = words.filter(word => word.includes(lowerKeyword));

    return (keywordMatches.length / words.length) * 100;
}

/**
 * Check if keyword density is optimal (1-2%)
 * @param {string} text - Text content
 * @param {string} keyword - Target keyword
 * @returns {boolean}
 */
export function isOptimalKeywordDensity(text, keyword) {
    const density = calculateKeywordDensity(text, keyword);
    return density >= 1 && density <= 2;
}

/**
 * Generate title tag với keyword optimization
 * @param {string} keyword - Primary keyword
 * @param {string} brand - Brand name
 * @param {number} maxLength - Max length (default 60)
 * @returns {string}
 */
export function generateOptimizedTitle(keyword, brand = 'TDDW', maxLength = 60) {
    // Format: Keyword | Brand Name - Year
    const year = new Date().getFullYear();
    const baseTitle = `${keyword} | ${brand} - ${year}`;

    if (baseTitle.length <= maxLength) {
        return baseTitle;
    }

    // Truncate if too long, keep keyword
    const availableLength = maxLength - brand.length - year.toString().length - 4; // " | " and " - "
    const truncatedKeyword = keyword.substring(0, availableLength);

    return `${truncatedKeyword} | ${brand} - ${year}`;
}

/**
 * Generate meta description với CTA
 * @param {string} description - Base description
 * @param {string} cta - Call to action
 * @param {number} maxLength - Max length (default 160)
 * @returns {string}
 */
export function generateOptimizedMetaDescription(description, cta = 'Miễn phí 100%', maxLength = 160) {
    const fullDescription = `${description} ${cta}`;

    if (fullDescription.length <= maxLength) {
        return fullDescription;
    }

    // Truncate description, keep CTA
    const availableLength = maxLength - cta.length - 1; // space
    const truncated = description.substring(0, availableLength - 3) + '...';

    return `${truncated} ${cta}`;
}

/**
 * Extract H1-H6 headings from HTML
 * Useful for checking heading structure
 * @param {string} html - HTML content
 * @returns {Array} - Array of headings
 */
export function extractHeadings(html) {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    return Array.from(headings).map((heading, index) => ({
        index,
        level: heading.tagName.toLowerCase(),
        text: heading.textContent.trim(),
        length: heading.textContent.trim().length
    }));
}

/**
 * Check if page has optimal heading structure
 * @param {string} html - HTML content
 * @returns {Object} - Analysis result
 */
export function analyzeHeadingStructure(html) {
    const headings = extractHeadings(html);
    const h1Count = headings.filter(h => h.level === 'h1').length;
    const issues = [];

    // Check for multiple H1s
    if (h1Count > 1) {
        issues.push('Multiple H1 tags found. Should have only one H1 per page.');
    }

    // Check for missing H1
    if (h1Count === 0) {
        issues.push('No H1 tag found. Each page should have one H1.');
    }

    // Check heading hierarchy
    let previousLevel = 0;
    headings.forEach(heading => {
        const level = parseInt(heading.level.charAt(1));
        if (previousLevel > 0 && level > previousLevel + 1) {
            issues.push(`Heading hierarchy skipped: ${previousLevel} → ${level}`);
        }
        previousLevel = level;
    });

    return {
        headings,
        h1Count,
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Calculate content score based on various factors
 * @param {Object} contentData - Content metrics
 * @returns {number} - Content score (0-100)
 */
export function calculateContentScore(contentData) {
    let score = 0;
    const {
        wordCount = 0,
        hasH1 = false,
        hasMetaDescription = false,
        hasKeywords = false,
        hasInternalLinks = false,
        hasImages = false,
        hasAltText = false
    } = contentData;

    // Word count (40 points max)
    if (wordCount >= 1000) score += 40;
    else if (wordCount >= 500) score += 30;
    else if (wordCount >= 300) score += 20;
    else score += 10;

    // H1 tag (10 points)
    if (hasH1) score += 10;

    // Meta description (10 points)
    if (hasMetaDescription) score += 10;

    // Keywords (10 points)
    if (hasKeywords) score += 10;

    // Internal links (15 points)
    if (hasInternalLinks) score += 15;

    // Images with alt text (15 points)
    if (hasImages && hasAltText) score += 15;
    else if (hasImages) score += 5;

    return Math.min(score, 100);
}

/**
 * Generate internal linking suggestions
 * @param {string} currentPage - Current page path
 * @param {Array} allPages - All available pages
 * @param {number} maxLinks - Maximum links to suggest
 * @returns {Array} - Suggested internal links
 */
export function suggestInternalLinks(currentPage, allPages, maxLinks = 5) {
    // Filter out current page
    const otherPages = allPages.filter(page => page.path !== currentPage);

    // Prioritize:
    // 1. Related pages (same category)
    // 2. High-authority pages (homepage, main tools)
    // 3. Recently updated pages

    const suggestions = otherPages
        .map(page => {
            let score = 0;

            // High priority pages
            if (page.path === '/' || page.priority >= 0.95) {
                score += 10;
            }

            // Related category
            const currentCategory = currentPage.split('/')[1];
            const pageCategory = page.path.split('/')[1];
            if (currentCategory === pageCategory) {
                score += 5;
            }

            // Recently updated
            if (page.lastModified) {
                const daysSinceUpdate = (Date.now() - new Date(page.lastModified)) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate < 30) {
                    score += 3;
                }
            }

            return { ...page, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, maxLinks);

    return suggestions;
}

/**
 * Check page speed score thresholds
 * @param {Object} metrics - PageSpeed metrics
 * @returns {Object} - Analysis with recommendations
 */
export function analyzePageSpeed(metrics) {
    const {
        lcp = 0, // Largest Contentful Paint
        fid = 0, // First Input Delay
        cls = 0, // Cumulative Layout Shift
        fcp = 0, // First Contentful Paint
        ttfb = 0 // Time to First Byte
    } = metrics;

    const analysis = {
        score: 0,
        issues: [],
        recommendations: []
    };

    // LCP (25 points)
    if (lcp < 2500) analysis.score += 25;
    else {
        analysis.issues.push(`LCP is ${lcp}ms (target: <2500ms)`);
        analysis.recommendations.push('Optimize images, use CDN, improve server response');
    }

    // FID (25 points)
    if (fid < 100) analysis.score += 25;
    else {
        analysis.issues.push(`FID is ${fid}ms (target: <100ms)`);
        analysis.recommendations.push('Minimize JavaScript, use code splitting');
    }

    // CLS (25 points)
    if (cls < 0.1) analysis.score += 25;
    else {
        analysis.issues.push(`CLS is ${cls} (target: <0.1)`);
        analysis.recommendations.push('Set image dimensions, avoid layout shifts');
    }

    // FCP (15 points)
    if (fcp < 1800) analysis.score += 15;
    else {
        analysis.issues.push(`FCP is ${fcp}ms (target: <1800ms)`);
        analysis.recommendations.push('Optimize critical rendering path');
    }

    // TTFB (10 points)
    if (ttfb < 800) analysis.score += 10;
    else {
        analysis.issues.push(`TTFB is ${ttfb}ms (target: <800ms)`);
        analysis.recommendations.push('Use caching, optimize server');
    }

    return analysis;
}

/**
 * Generate SEO checklist for a page
 * @param {Object} pageData - Page SEO data
 * @returns {Array} - Checklist items
 */
export function generateSEOChecklist(pageData) {
    const checklist = [];

    // Title tag
    checklist.push({
        item: 'Title tag (50-60 characters)',
        status: pageData.title && pageData.title.length >= 50 && pageData.title.length <= 60,
        priority: 'HIGH'
    });

    // Meta description
    checklist.push({
        item: 'Meta description (150-160 characters)',
        status: pageData.metaDescription &&
            pageData.metaDescription.length >= 150 &&
            pageData.metaDescription.length <= 160,
        priority: 'HIGH'
    });

    // H1 tag
    checklist.push({
        item: 'One unique H1 tag',
        status: pageData.h1Count === 1,
        priority: 'HIGH'
    });

    // Keywords
    checklist.push({
        item: 'Primary keyword in title and H1',
        status: pageData.hasPrimaryKeyword,
        priority: 'HIGH'
    });

    // Internal links
    checklist.push({
        item: 'At least 2-3 internal links',
        status: pageData.internalLinksCount >= 2,
        priority: 'MEDIUM'
    });

    // Images with alt text
    checklist.push({
        item: 'Images have alt text',
        status: pageData.imagesWithAltText === pageData.imagesCount,
        priority: 'MEDIUM'
    });

    // Word count
    checklist.push({
        item: 'Content length (1000+ words for main pages)',
        status: pageData.wordCount >= 1000,
        priority: 'MEDIUM'
    });

    // Schema markup
    checklist.push({
        item: 'Structured data (schema markup)',
        status: pageData.hasSchemaMarkup,
        priority: 'MEDIUM'
    });

    // Canonical URL
    checklist.push({
        item: 'Canonical URL set',
        status: pageData.hasCanonicalUrl,
        priority: 'HIGH'
    });

    // Mobile-friendly
    checklist.push({
        item: 'Mobile-friendly',
        status: pageData.isMobileFriendly,
        priority: 'HIGH'
    });

    return checklist;
}

/**
 * Calculate overall SEO score
 * @param {Object} pageData - Complete page SEO data
 * @returns {Object} - Overall score and breakdown
 */
export function calculateOverallSEOScore(pageData) {
    const checklist = generateSEOChecklist(pageData);
    const highPriorityCount = checklist.filter(item => item.priority === 'HIGH' && item.status).length;
    const mediumPriorityCount = checklist.filter(item => item.priority === 'MEDIUM' && item.status).length;

    const totalHigh = checklist.filter(item => item.priority === 'HIGH').length;
    const totalMedium = checklist.filter(item => item.priority === 'MEDIUM').length;

    const highScore = (highPriorityCount / totalHigh) * 60;
    const mediumScore = (mediumPriorityCount / totalMedium) * 40;

    const overallScore = highScore + mediumScore;

    return {
        score: Math.round(overallScore),
        breakdown: {
            highPriority: {
                completed: highPriorityCount,
                total: totalHigh,
                score: Math.round(highScore)
            },
            mediumPriority: {
                completed: mediumPriorityCount,
                total: totalMedium,
                score: Math.round(mediumScore)
            }
        },
        checklist
    };
}













