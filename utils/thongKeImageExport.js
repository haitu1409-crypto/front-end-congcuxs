/**
 * Utility để export các box thống kê thành hình ảnh
 * Sử dụng API backend để generate hình ảnh với Puppeteer (giống như xsmbImageGenerator)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendkqxs-1.onrender.com';

/**
 * Generate hình ảnh từ HTML string của một box
 * @param {string} boxHTML - HTML string của box cần chụp
 * @param {string} boxId - ID của box (optional)
 * @param {Object} options - Options cho screenshot (optional)
 * @returns {Promise<Blob>} Blob của hình ảnh PNG
 */
export async function generateBoxImage(boxHTML, boxId = null, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/thongke/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: boxHTML,
                boxId,
                options
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('[ThongKeImageExport] Lỗi khi generate hình ảnh:', error);
        throw error;
    }
}

/**
 * Generate nhiều hình ảnh từ nhiều box HTML
 * @param {Array<{html: string, id?: string, options?: Object}>} boxes - Mảng các box cần chụp
 * @returns {Promise<Array<{index: number, data: string, mimeType: string}>>} Mảng các hình ảnh base64
 */
export async function generateMultipleBoxImages(boxes) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/thongke/generate-multiple-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boxes })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.images || [];
    } catch (error) {
        console.error('[ThongKeImageExport] Lỗi khi generate nhiều hình ảnh:', error);
        throw error;
    }
}

/**
 * Download hình ảnh từ Blob
 * @param {Blob} blob - Blob của hình ảnh
 * @param {string} filename - Tên file để download
 */
export function downloadImage(blob, filename = 'thongke-box.png') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Convert base64 image data thành Blob
 * @param {string} base64Data - Base64 string của hình ảnh
 * @param {string} mimeType - MIME type (default: 'image/png')
 * @returns {Blob} Blob của hình ảnh
 */
export function base64ToBlob(base64Data, mimeType = 'image/png') {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

/**
 * Extract HTML của một element và các children của nó
 * @param {HTMLElement} element - Element cần extract HTML
 * @returns {string} HTML string của element
 */
export function extractElementHTML(element) {
    if (!element) return '';
    
    // Clone element để không ảnh hưởng đến DOM gốc
    const clone = element.cloneNode(true);
    
    // Convert thành HTML string
    return clone.outerHTML;
}

/**
 * Extract HTML của tất cả các box thống kê từ component
 * @param {string} containerId - ID của container chứa các box (default: 'tknhanh')
 * @returns {Array<{id: string, html: string, title: string}>} Mảng các box với HTML
 */
export function extractAllBoxesHTML(containerId = 'tknhanh') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[ThongKeImageExport] Không tìm thấy container với ID: ${containerId}`);
        return [];
    }

    const boxes = [];
    
    // Tìm tất cả các box chính (các div có border và là direct children của container hoặc có section title)
    // Các box chính thường có:
    // 1. Border: 1px solid rgb(196, 210, 227)
    // 2. Có header với background #3a8de0 hoặc #D5E9FD
    // 3. Hoặc có section title với background #D5E9FD
    
    const allDivs = container.querySelectorAll('div');
    const processedBoxes = new Set();
    
    allDivs.forEach((div, index) => {
        // Bỏ qua nếu đã xử lý hoặc là child của box đã xử lý
        if (processedBoxes.has(div)) return;
        
        const style = div.getAttribute('style') || '';
        
        // Kiểm tra xem đây có phải là box chính không
        const hasBorder = style.includes('border:') && style.includes('rgb(196, 210, 227)');
        const hasHeader = div.querySelector('[style*="background"][style*="#3a8de0"]') || 
                         div.querySelector('[style*="background"][style*="#D5E9FD"]');
        const hasSectionTitle = div.querySelector('[style*="color: rgb(1, 65, 182)"][style*="font-weight: bold"]');
        
        // Box chính thường có border và header hoặc section title
        if (hasBorder && (hasHeader || hasSectionTitle || div.children.length > 3)) {
            // Tìm title
            let titleElement = div.querySelector('[style*="background"][style*="#3a8de0"]') ||
                              div.querySelector('[style*="background"][style*="#D5E9FD"]') ||
                              div.querySelector('[style*="color: rgb(1, 65, 182)"][style*="font-weight: bold"]') ||
                              div.querySelector('[style*="font-weight: bold"]');
            
            const title = titleElement ? titleElement.textContent.trim() : `Box ${boxes.length + 1}`;
            const boxId = `thongke-box-${boxes.length}`;
            
            // Clone box và thêm ID
            const clone = div.cloneNode(true);
            clone.setAttribute('id', boxId);
            
            // Đánh dấu tất cả children đã được xử lý
            const allChildren = clone.querySelectorAll('*');
            allChildren.forEach(child => processedBoxes.add(child));
            processedBoxes.add(div);
            
            boxes.push({
                id: boxId,
                html: clone.outerHTML,
                title: title.substring(0, 50) // Giới hạn độ dài title
            });
        }
    });

    // Nếu không tìm thấy box nào, thử cách khác: tìm các div có border và nhiều children
    if (boxes.length === 0) {
        const borderDivs = Array.from(container.querySelectorAll('div[style*="border"]'))
            .filter(div => {
                const style = div.getAttribute('style') || '';
                return style.includes('border:') && div.children.length > 2;
            });
        
        borderDivs.forEach((div, index) => {
            const title = `Box ${index + 1}`;
            const boxId = `thongke-box-${index}`;
            const clone = div.cloneNode(true);
            clone.setAttribute('id', boxId);
            
            boxes.push({
                id: boxId,
                html: clone.outerHTML,
                title
            });
        });
    }

    return boxes;
}

