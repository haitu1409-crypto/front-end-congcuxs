/**
 * Breadcrumb Schema Component
 * Helps search engines understand page hierarchy
 * Shows breadcrumbs in search results
 */

import React from 'react';

export default function BreadcrumbSchema({ breadcrumbs }) {
    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://taodandewukong.pro${item.url}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Example usage:
 * 
 * const breadcrumbs = [
 *   { name: "Trang chủ", url: "/" },
 *   { name: "Dàn 9x-0x", url: "/dan-9x0x" }
 * ];
 * 
 * <BreadcrumbSchema breadcrumbs={breadcrumbs} />
 */




