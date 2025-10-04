#!/usr/bin/env node

/**
 * Image Optimization Script
 * Tối ưu hóa và tạo các kích thước icon khác nhau
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️ Tối ưu hóa images và icons...\n');

// Kiểm tra các file icon cần thiết
const publicDir = path.join(__dirname, '../public');
const requiredIcons = [
    'favicon.ico',
    'icon-192.png',
    'icon-512.png'
];

const missingIcons = [];
requiredIcons.forEach(icon => {
    const iconPath = path.join(publicDir, icon);
    if (!fs.existsSync(iconPath)) {
        missingIcons.push(icon);
    } else {
        const stats = fs.statSync(iconPath);
        console.log(`✅ ${icon}: ${(stats.size / 1024).toFixed(2)} KB`);
    }
});

if (missingIcons.length > 0) {
    console.log('\n❌ Missing icons:');
    missingIcons.forEach(icon => console.log(`  - ${icon}`));
} else {
    console.log('\n✅ Tất cả icons đã có sẵn!');
}

// Kiểm tra manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        console.log('\n📱 PWA Manifest:');
        console.log(`  Name: ${manifest.name}`);
        console.log(`  Short Name: ${manifest.short_name}`);
        console.log(`  Icons: ${manifest.icons.length} defined`);
        
        // Kiểm tra tất cả icons trong manifest có tồn tại không
        let allIconsExist = true;
        manifest.icons.forEach(icon => {
            const iconPath = path.join(publicDir, icon.src.replace('/', ''));
            if (!fs.existsSync(iconPath)) {
                console.log(`  ❌ Missing: ${icon.src}`);
                allIconsExist = false;
            }
        });
        
        if (allIconsExist) {
            console.log('  ✅ Tất cả icons trong manifest đều tồn tại');
        }
    } catch (error) {
        console.log('❌ Lỗi khi đọc manifest.json:', error.message);
    }
} else {
    console.log('❌ Không tìm thấy manifest.json');
}

// Kiểm tra thư mục imgs
const imgsDir = path.join(publicDir, 'imgs');
if (fs.existsSync(imgsDir)) {
    const images = fs.readdirSync(imgsDir);
    console.log('\n🖼️ Images trong thư mục imgs:');
    images.forEach(img => {
        const imgPath = path.join(imgsDir, img);
        const stats = fs.statSync(imgPath);
        console.log(`  ${img}: ${(stats.size / 1024).toFixed(2)} KB`);
    });
} else {
    console.log('\n❌ Không tìm thấy thư mục imgs');
}

// Recommendations
console.log('\n💡 Khuyến nghị tối ưu hóa:');
console.log('  1. Sử dụng WebP format cho images hiện đại');
console.log('  2. Tạo multiple sizes cho responsive images');
console.log('  3. Compress images để giảm file size');
console.log('  4. Sử dụng next/image component cho lazy loading');

console.log('\n🎉 Kiểm tra images hoàn tất!');
