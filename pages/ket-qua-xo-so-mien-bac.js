/**
 * Kết Quả Xổ Số Miền Bắc Page
 * Route: /ket-qua-xo-so-mien-bac
 * Canonical URL: https://taodandewukong.pro/ket-qua-xo-so-mien-bac
 * 
 * This page is the canonical version for SEO
 * Redirects to /kqxs internally but maintains the SEO-friendly URL
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import the actual KQXS page component
const KQXSPage = dynamic(() => import('./kqxs'), {
    ssr: true,
    loading: () => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontSize: '18px',
            color: '#666'
        }}>
            Đang tải kết quả xổ số...
        </div>
    )
});

export default function KetQuaXoSoMienBacPage() {
    const router = useRouter();
    
    // This page uses the same component as /kqxs
    // but maintains the SEO-friendly URL /ket-qua-xo-so-mien-bac
    return <KQXSPage />;
}

// ✅ Ensure this page is indexed
export async function getServerSideProps({ res }) {
    // Set headers for SEO
    res.setHeader('X-Robots-Tag', 'index, follow');
    
    return {
        props: {}
    };
}




