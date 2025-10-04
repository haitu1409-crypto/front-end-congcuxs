#!/usr/bin/env node

/**
 * Performance Check Script
 * Kiểm tra hiệu suất của ứng dụng
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Bắt đầu kiểm tra hiệu suất...\n');

// 1. Kiểm tra bundle size
console.log('📦 Kiểm tra bundle size...');
try {
    // Build ứng dụng
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Kiểm tra kích thước các file
    const buildDir = path.join(__dirname, '../.next');
    if (fs.existsSync(buildDir)) {
        console.log('✅ Build thành công!');
        
        // Đọc build manifest
        const manifestPath = path.join(buildDir, 'build-manifest.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            console.log('📊 Bundle analysis:');
            
            Object.entries(manifest.pages).forEach(([page, files]) => {
                const totalSize = files.reduce((acc, file) => {
                    const filePath = path.join(buildDir, 'static', file);
                    if (fs.existsSync(filePath)) {
                        return acc + fs.statSync(filePath).size;
                    }
                    return acc;
                }, 0);
                
                console.log(`  ${page}: ${(totalSize / 1024).toFixed(2)} KB`);
            });
        }
    }
} catch (error) {
    console.error('❌ Build failed:', error.message);
}

// 2. Kiểm tra dependencies
console.log('\n📋 Kiểm tra dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log(`📦 Tổng số packages: ${Object.keys(deps).length}`);
    
    // Kiểm tra các packages lớn
    const largeDeps = [
        'react', 'react-dom', 'next', 'lucide-react', 'html2canvas'
    ];
    
    largeDeps.forEach(dep => {
        if (deps[dep]) {
            console.log(`  ${dep}: ${deps[dep]}`);
        }
    });
    
} catch (error) {
    console.error('❌ Không thể đọc package.json:', error.message);
}

// 3. Kiểm tra code splitting
console.log('\n🔄 Kiểm tra code splitting...');
const pagesDir = path.join(__dirname, '../pages');
const componentsDir = path.join(__dirname, '../components');

// Kiểm tra lazy loading
const checkLazyLoading = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let lazyCount = 0;
    let totalCount = 0;
    
    files.forEach(file => {
        if (file.isFile() && file.name.endsWith('.js')) {
            totalCount++;
            const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
            if (content.includes('lazy(') || content.includes('Suspense')) {
                lazyCount++;
            }
        }
    });
    
    return { lazyCount, totalCount };
};

if (fs.existsSync(pagesDir)) {
    const { lazyCount, totalCount } = checkLazyLoading(pagesDir);
    console.log(`📄 Pages: ${lazyCount}/${totalCount} sử dụng lazy loading`);
}

if (fs.existsSync(componentsDir)) {
    const { lazyCount, totalCount } = checkLazyLoading(componentsDir);
    console.log(`🧩 Components: ${lazyCount}/${totalCount} sử dụng lazy loading`);
}

// 4. Kiểm tra tối ưu hóa images
console.log('\n🖼️ Kiểm tra tối ưu hóa images...');
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
    const checkImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        let imageCount = 0;
        let totalSize = 0;
        
        files.forEach(file => {
            if (file.isFile() && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name)) {
                imageCount++;
                const filePath = path.join(dir, file.name);
                totalSize += fs.statSync(filePath).size;
            }
        });
        
        return { imageCount, totalSize };
    };
    
    const { imageCount, totalSize } = checkImages(publicDir);
    console.log(`📸 Images: ${imageCount} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB total`);
}

// 5. Kiểm tra CSS optimization
console.log('\n🎨 Kiểm tra CSS optimization...');
const stylesDir = path.join(__dirname, '../styles');
if (fs.existsSync(stylesDir)) {
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    let totalCssSize = 0;
    
    cssFiles.forEach(file => {
        const filePath = path.join(stylesDir, file);
        totalSize += fs.statSync(filePath).size;
    });
    
    console.log(`🎨 CSS files: ${cssFiles.length}, ${(totalCssSize / 1024).toFixed(2)} KB total`);
}

// 6. Performance recommendations
console.log('\n💡 Khuyến nghị tối ưu hóa:');
console.log('  ✅ Sử dụng React.memo cho components');
console.log('  ✅ Implement lazy loading');
console.log('  ✅ Sử dụng useMemo và useCallback');
console.log('  ✅ Tối ưu hóa bundle splitting');
console.log('  ✅ Caching API responses');
console.log('  ✅ Compression middleware');
console.log('  ✅ Optimized icon imports');

console.log('\n🎉 Kiểm tra hiệu suất hoàn tất!');
console.log('\n📈 Để phân tích chi tiết bundle:');
console.log('  npm install --save-dev @next/bundle-analyzer');
console.log('  ANALYZE=true npm run build');
