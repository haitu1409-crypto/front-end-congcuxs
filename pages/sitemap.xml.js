/**
 * Dynamic Sitemap Generator
 * Tạo sitemap.xml động cho Next.js
 */

import generateSitemap from '../components/SEOSitemap';

function Sitemap() {
    // This function will be called by Next.js
}

export async function getServerSideProps({ res }) {
    const sitemap = generateSitemap();

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}

export default Sitemap;
