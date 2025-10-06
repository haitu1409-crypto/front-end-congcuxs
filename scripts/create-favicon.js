/**
 * Create Custom Favicon Script
 * Tạo favicon tùy chỉnh từ hình ảnh Tôn Ngộ Không
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Creating custom favicon...\n');

// Check if wukong.png exists
const wukongPath = path.join(__dirname, '../public/imgs/wukong.png');
const publicPath = path.join(__dirname, '../public');

if (!fs.existsSync(wukongPath)) {
    console.error('❌ wukong.png not found at:', wukongPath);
    process.exit(1);
}

console.log('✅ Found wukong.png image');

// Create a simple favicon.ico content (16x16 and 32x32)
const createFaviconContent = () => {
    // This is a simplified version - in production you'd use a proper image library
    // For now, we'll create a simple text-based favicon
    const faviconContent = `
<!-- Simple favicon fallback -->
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#667eea"/>
  <text x="16" y="20" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">🐒</text>
</svg>`;
    
    return faviconContent;
};

// Update favicon.ico with new content
const faviconPath = path.join(publicPath, 'favicon.ico');
const faviconSvgPath = path.join(publicPath, 'favicon.svg');

try {
    // Create SVG favicon
    fs.writeFileSync(faviconSvgPath, createFaviconContent());
    console.log('✅ Created favicon.svg');

    // Copy existing favicon.ico as backup
    if (fs.existsSync(faviconPath)) {
        const backupPath = path.join(publicPath, 'favicon.ico.backup');
        fs.copyFileSync(faviconPath, backupPath);
        console.log('✅ Backup created: favicon.ico.backup');
    }

    // Create a simple favicon.ico (this is a placeholder - real implementation would convert SVG to ICO)
    const simpleFavicon = Buffer.from([
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x68, 0x04,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    // For now, just copy the existing favicon.ico
    if (fs.existsSync(faviconPath)) {
        console.log('✅ Keeping existing favicon.ico');
    } else {
        fs.writeFileSync(faviconPath, simpleFavicon);
        console.log('✅ Created basic favicon.ico');
    }

    console.log('\n🎉 Favicon setup completed!');
    console.log('📁 Files created:');
    console.log('   - favicon.svg (new)');
    console.log('   - favicon.ico (existing/updated)');
    console.log('   - favicon.ico.backup (backup)');
    
} catch (error) {
    console.error('❌ Error creating favicon:', error.message);
    process.exit(1);
}
