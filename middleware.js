/**
 * Next.js Middleware
 * Tự động redirect từ non-www sang www để đảm bảo canonical URL nhất quán
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
    const { nextUrl } = request;
    const hostname = request.headers.get('host') || '';

    // Kiểm tra nếu hostname là taodandewukong.pro (không có www)
    // Chỉ redirect trong production (không redirect trên localhost)
    if (
        process.env.NODE_ENV === 'production' &&
        hostname === 'taodandewukong.pro'
    ) {
        // Tạo URL mới với www
        const url = nextUrl.clone();
        url.hostname = 'www.taodandewukong.pro';
        
        // Redirect 301 (Permanent Redirect) để SEO tốt hơn
        // Giữ nguyên path và query string
        return NextResponse.redirect(url, 301);
    }

    // Không redirect, tiếp tục request bình thường
    return NextResponse.next();
}

// Middleware sẽ chạy cho tất cả routes trừ static files và api routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - robots.txt, sitemap.xml (SEO files)
         * - static files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};

