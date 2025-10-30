#!/usr/bin/env node
/**
 * Script để tạo file .env.local từ template
 * Chạy: node create-env-local.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# Site URLs - PRODUCTION (QUAN TRỌNG!)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_NAME=Dàn Đề Wukong

# Google Analytics
NEXT_PUBLIC_GA_ID=G-RLCH8J3MHR

# ============================================
# SEARCH ENGINE VERIFICATION CODES
# ============================================

#  Bing Webmaster - ĐÃ CÓ!
NEXT_PUBLIC_BING_VERIFICATION=B5B5DA53487A24CF17E317DB42CB0948

# Google Search Console - Bạn sẽ thêm sau
NEXT_PUBLIC_GOOGLE_VERIFICATION=

# Cốc Cốc Webmaster - Bạn sẽ thêm sau
NEXT_PUBLIC_COCCOC_VERIFICATION=

# ============================================
# Cloudinary (giữ nguyên)
# ============================================
CLOUDINARY_CLOUD_NAME=db15lvbrw
CLOUDINARY_API_KEY=685414381137448
CLOUDINARY_API_SECRET=6CNRrgEZQNt4GFggzkt0G5A8ePY
`;

const envFilePath = path.join(__dirname, '.env.local');

try {
    // Kiểm tra xem file đã tồn tại chưa
    if (fs.existsSync(envFilePath)) {
        console.log('⚠️  File .env.local đã tồn tại!');
        console.log('📝 Vui lòng kiểm tra nội dung file hiện tại.');
        process.exit(0);
    }

    // Tạo file .env.local
    fs.writeFileSync(envFilePath, envContent, 'utf8');
    console.log('✅ Đã tạo file .env.local thành công!');
    console.log('🔄 Vui lòng restart Next.js dev server để áp dụng thay đổi.');
    console.log('');
    console.log('📋 Nội dung file:');
    console.log(envContent);
} catch (error) {
    console.error('❌ Lỗi khi tạo file .env.local:', error.message);
    process.exit(1);
}

