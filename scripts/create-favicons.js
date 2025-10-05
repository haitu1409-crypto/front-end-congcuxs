/**
 * Create Multiple Favicon Sizes
 * Tạo favicon với nhiều kích thước khác nhau từ wukong.png
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️ Creating favicon files from wukong.png...\n');

// Source image path
const sourceImage = path.join(__dirname, '../public/imgs/wukong.png');
const publicDir = path.join(__dirname, '../public');

// Check if source image exists
if (!fs.existsSync(sourceImage)) {
    console.error('❌ Source image not found:', sourceImage);
    process.exit(1);
}

// Favicon sizes needed for Google Search
const faviconSizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.ico', size: 32 } // ICO format
];

console.log('📋 Required favicon files:');
faviconSizes.forEach(fav => {
    console.log(`   ${fav.name} (${fav.size}x${fav.size})`);
});

console.log('\n⚠️  Note: This script creates placeholder favicon files.');
console.log('   For production, use tools like:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://favicon.io/');
console.log('   - https://www.favicon-generator.org/');

// Create placeholder favicon files
faviconSizes.forEach(fav => {
    const filePath = path.join(publicDir, fav.name);
    
    if (fav.name.endsWith('.ico')) {
        // Copy existing favicon.ico as base
        const existingFavicon = path.join(publicDir, 'favicon.ico');
        if (fs.existsSync(existingFavicon)) {
            fs.copyFileSync(existingFavicon, filePath);
            console.log(`✅ Created placeholder: ${fav.name}`);
        } else {
            // Create a minimal ICO file placeholder
            const icoContent = Buffer.from([
                0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00,
                0x20, 0x00, 0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
            ]);
            fs.writeFileSync(filePath, icoContent);
            console.log(`✅ Created placeholder: ${fav.name}`);
        }
    } else {
        // Copy existing icon as base for PNG files
        const existingIcon = path.join(publicDir, 'icon-192.png');
        if (fs.existsSync(existingIcon)) {
            fs.copyFileSync(existingIcon, filePath);
            console.log(`✅ Created placeholder: ${fav.name}`);
        } else {
            // Create a minimal PNG file placeholder
            const pngContent = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
                0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, 0x61, 0x00, 0x00, 0x00,
                0x0A, 0x49, 0x44, 0x41, 0x54, 0x38, 0x8D, 0x63, 0x60, 0x00, 0x02, 0x00,
                0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00,
                0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            fs.writeFileSync(filePath, pngContent);
            console.log(`✅ Created placeholder: ${fav.name}`);
        }
    }
});

console.log('\n🎯 Next steps:');
console.log('1. Visit https://realfavicongenerator.net/');
console.log('2. Upload your wukong.png image');
console.log('3. Generate all favicon formats');
console.log('4. Download and replace the placeholder files');
console.log('5. Deploy the updated favicons');

console.log('\n✅ Favicon placeholders created successfully!');
