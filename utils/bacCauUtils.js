/**
 * Utilities cho các quy luật Bắc Cầu (Bridge Rules)
 * Dựa trên logic từ file giai-dac-biet-tuan.js và các quy luật soi cầu truyền thống
 */

/**
 * Tính toán thông tin từ số giải đặc biệt
 * @param {string} number - Số giải đặc biệt (5 chữ số)
 * @returns {object} - Thông tin gồm: lastTwo (bộ), head, tail, total, evenOdd
 */
export const calculateSpecialInfo = (number) => {
    if (!number || typeof number !== 'string') {
        number = String(number || '00000');
    }
    
    const lastTwo = number.slice(-2);
    const firstDigit = parseInt(lastTwo[0]) || 0;
    const secondDigit = parseInt(lastTwo[1]) || 0;
    const total = firstDigit + secondDigit;
    const isEven = total % 2 === 0;
    
    return {
        lastTwo,           // 2 số cuối (Bộ)
        total,             // Tổng 2 số cuối
        head: firstDigit,  // Đầu (chữ số đầu của 2 số cuối)
        tail: secondDigit, // Đuôi (chữ số thứ 2 của 2 số cuối)
        evenOdd: isEven ? 'C' : 'L', // Chẵn lẻ
        lastThree: number.slice(-3), // 3 số cuối (3 Càng)
        fullNumber: number
    };
};

/**
 * Cầu Cột (Column Bridge) - Lấy 2 số cuối của các số trong cùng một cột
 * @param {Array<Array<string>>} grid - Mảng 2 chiều chứa các số (hàng x cột)
 * @param {number} columnIndex - Chỉ số cột (0-based)
 * @returns {Array<string>} - Mảng các 2 số cuối từ cột đó
 */
export const getColumnBridge = (grid, columnIndex) => {
    if (!grid || !Array.isArray(grid) || columnIndex < 0) {
        return [];
    }
    
    const columnNumbers = [];
    for (let row = 0; row < grid.length; row++) {
        if (grid[row] && Array.isArray(grid[row]) && grid[row][columnIndex]) {
            const number = String(grid[row][columnIndex]);
            if (number.length >= 2) {
                columnNumbers.push(number.slice(-2));
            }
        }
    }
    
    return columnNumbers;
};

/**
 * Cầu Hàng (Row Bridge) - Lấy 2 số cuối của các số trong cùng một hàng
 * @param {Array<Array<string>>} grid - Mảng 2 chiều chứa các số
 * @param {number} rowIndex - Chỉ số hàng (0-based)
 * @returns {Array<string>} - Mảng các 2 số cuối từ hàng đó
 */
export const getRowBridge = (grid, rowIndex) => {
    if (!grid || !Array.isArray(grid) || rowIndex < 0 || !grid[rowIndex]) {
        return [];
    }
    
    const rowNumbers = [];
    for (let col = 0; col < grid[rowIndex].length; col++) {
        if (grid[rowIndex][col]) {
            const number = String(grid[rowIndex][col]);
            if (number.length >= 2) {
                rowNumbers.push(number.slice(-2));
            }
        }
    }
    
    return rowNumbers;
};

/**
 * Cầu Đường Chéo (Diagonal Bridge) - Lấy 2 số cuối từ đường chéo
 * @param {Array<Array<string>>} grid - Mảng 2 chiều chứa các số
 * @param {number} startRow - Hàng bắt đầu
 * @param {number} startCol - Cột bắt đầu
 * @param {boolean} isMainDiagonal - true = đường chéo chính, false = đường chéo phụ
 * @returns {Array<string>} - Mảng các 2 số cuối từ đường chéo
 */
export const getDiagonalBridge = (grid, startRow, startCol, isMainDiagonal = true) => {
    if (!grid || !Array.isArray(grid)) {
        return [];
    }
    
    const diagonalNumbers = [];
    let row = startRow;
    let col = startCol;
    
    while (row >= 0 && row < grid.length && col >= 0 && grid[row] && col < grid[row].length) {
        if (grid[row][col]) {
            const number = String(grid[row][col]);
            if (number.length >= 2) {
                diagonalNumbers.push(number.slice(-2));
            }
        }
        
        row += isMainDiagonal ? 1 : 1;
        col += isMainDiagonal ? 1 : -1;
    }
    
    return diagonalNumbers;
};

/**
 * Ghép Đầu Đuôi (Head-Tail Pairing) - Ghép đầu của số này với đuôi của số kia
 * @param {Array<string>} numbers - Mảng các số (2 số cuối)
 * @returns {Array<string>} - Mảng các số sau khi ghép
 */
export const getHeadTailPairing = (numbers) => {
    if (!numbers || numbers.length < 2) {
        return [];
    }
    
    const results = [];
    for (let i = 0; i < numbers.length - 1; i++) {
        const num1 = String(numbers[i]).padStart(2, '0');
        const num2 = String(numbers[i + 1]).padStart(2, '0');
        
        // Ghép đầu num1 với đuôi num2
        const head1 = num1[0];
        const tail2 = num2[1];
        results.push(head1 + tail2);
        
        // Ghép đuôi num1 với đầu num2
        const tail1 = num1[1];
        const head2 = num2[0];
        results.push(tail1 + head2);
    }
    
    return results;
};

/**
 * Tính tổng các chữ số và lấy mod 10 để dự đoán
 * @param {Array<string>} numbers - Mảng các số (2 số cuối)
 * @returns {string} - Số dự đoán từ tổng
 */
export const getSumBridge = (numbers) => {
    if (!numbers || numbers.length === 0) {
        return '';
    }
    
    let total = 0;
    numbers.forEach(num => {
        const numStr = String(num).padStart(2, '0');
        total += parseInt(numStr[0]) || 0;
        total += parseInt(numStr[1]) || 0;
    });
    
    const result = total % 100;
    return String(result).padStart(2, '0');
};

/**
 * Cầu Tổng (Sum Bridge) - Tính tổng từng số rồi lấy 2 số cuối
 * @param {Array<string>} numbers - Mảng các số (2 số cuối)
 * @returns {Array<number>} - Mảng các tổng
 */
export const getSumArray = (numbers) => {
    if (!numbers || numbers.length === 0) {
        return [];
    }
    
    return numbers.map(num => {
        const numStr = String(num).padStart(2, '0');
        return (parseInt(numStr[0]) || 0) + (parseInt(numStr[1]) || 0);
    });
};

/**
 * Tìm quy luật từ chuỗi các số (tìm pattern)
 * @param {Array<string>} numbers - Mảng các số (2 số cuối)
 * @returns {object} - Các quy luật tìm được
 */
export const findPattern = (numbers) => {
    if (!numbers || numbers.length < 3) {
        return { patterns: [], nextPrediction: null };
    }
    
    const patterns = [];
    const nums = numbers.map(n => String(n).padStart(2, '0'));
    
    // Kiểm tra quy luật cộng/trừ
    const differences = [];
    for (let i = 0; i < nums.length - 1; i++) {
        const diff = (parseInt(nums[i + 1]) - parseInt(nums[i]) + 100) % 100;
        differences.push(diff);
    }
    
    // Nếu có quy luật cộng/trừ đều
    if (differences.length > 1) {
        const firstDiff = differences[0];
        const isConsistent = differences.every(d => d === firstDiff);
        if (isConsistent && differences.length >= 2) {
            patterns.push({
                type: 'arithmetic',
                difference: firstDiff,
                description: `Cộng ${firstDiff}`
            });
            
            // Dự đoán số tiếp theo
            const lastNum = parseInt(nums[nums.length - 1]);
            const nextNum = (lastNum + firstDiff) % 100;
            return {
                patterns,
                nextPrediction: String(nextNum).padStart(2, '0')
            };
        }
    }
    
    // Kiểm tra quy luật tổng
    const sums = getSumArray(nums);
    const sumDiffs = [];
    for (let i = 0; i < sums.length - 1; i++) {
        sumDiffs.push(sums[i + 1] - sums[i]);
    }
    
    if (sumDiffs.length > 1) {
        const firstSumDiff = sumDiffs[0];
        const isSumConsistent = sumDiffs.every(d => d === firstSumDiff);
        if (isSumConsistent && sumDiffs.length >= 2) {
            patterns.push({
                type: 'sum_arithmetic',
                difference: firstSumDiff,
                description: `Tổng cộng ${firstSumDiff}`
            });
            
            // Dự đoán tổng tiếp theo
            const lastSum = sums[sums.length - 1];
            const nextSum = lastSum + firstSumDiff;
            // Tìm số có tổng bằng nextSum
            const possibleNumbers = [];
            for (let i = 0; i < 100; i++) {
                const numStr = String(i).padStart(2, '0');
                const sum = parseInt(numStr[0]) + parseInt(numStr[1]);
                if (sum === nextSum || sum === (nextSum % 18) || sum === (nextSum % 9)) {
                    possibleNumbers.push(numStr);
                }
            }
            return {
                patterns,
                nextPrediction: possibleNumbers.length > 0 ? possibleNumbers[0] : null
            };
        }
    }
    
    return { patterns, nextPrediction: null };
};

/**
 * Tìm chạm (Touch) - Các chữ số xuất hiện nhiều nhất
 * @param {Array<string>} numbers - Mảng các số (2 số cuối)
 * @returns {Array<string>} - Mảng các chữ số chạm
 */
export const findTouch = (numbers) => {
    if (!numbers || numbers.length === 0) {
        return [];
    }
    
    const digitCount = new Map();
    
    numbers.forEach(num => {
        const numStr = String(num).padStart(2, '0');
        for (let digit of numStr) {
            digitCount.set(digit, (digitCount.get(digit) || 0) + 1);
        }
    });
    
    // Tìm các chữ số xuất hiện nhiều nhất (>= 2 lần)
    const touches = [];
    const sortedDigits = Array.from(digitCount.entries())
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([digit]) => digit);
    
    return sortedDigits;
};

/**
 * Dự đoán từ cầu cột (Column Bridge Prediction)
 * @param {Array<Array<string>>} grid - Mảng 2 chiều
 * @param {number} columnIndex - Chỉ số cột
 * @returns {object} - Kết quả dự đoán
 */
export const predictFromColumnBridge = (grid, columnIndex) => {
    const columnNumbers = getColumnBridge(grid, columnIndex);
    if (columnNumbers.length < 3) {
        return { prediction: null, method: 'column', reason: 'Không đủ dữ liệu' };
    }
    
    const pattern = findPattern(columnNumbers);
    const touch = findTouch(columnNumbers);
    
    return {
        method: 'column_bridge',
        columnIndex,
        data: columnNumbers,
        pattern: pattern.patterns,
        touch,
        prediction: pattern.nextPrediction,
        sumBridge: getSumBridge(columnNumbers),
        headTailPairing: getHeadTailPairing(columnNumbers)
    };
};

/**
 * Dự đoán từ cầu hàng (Row Bridge Prediction)
 * @param {Array<Array<string>>} grid - Mảng 2 chiều
 * @param {number} rowIndex - Chỉ số hàng
 * @returns {object} - Kết quả dự đoán
 */
export const predictFromRowBridge = (grid, rowIndex) => {
    const rowNumbers = getRowBridge(grid, rowIndex);
    if (rowNumbers.length < 3) {
        return { prediction: null, method: 'row', reason: 'Không đủ dữ liệu' };
    }
    
    const pattern = findPattern(rowNumbers);
    const touch = findTouch(rowNumbers);
    
    return {
        method: 'row_bridge',
        rowIndex,
        data: rowNumbers,
        pattern: pattern.patterns,
        touch,
        prediction: pattern.nextPrediction,
        sumBridge: getSumBridge(rowNumbers),
        headTailPairing: getHeadTailPairing(rowNumbers)
    };
};

/**
 * Tìm tất cả các quy luật bắc cầu từ một lưới số
 * @param {Array<Array<string>>} grid - Mảng 2 chiều chứa các số
 * @returns {object} - Tất cả các quy luật tìm được
 */
export const findAllBridgeRules = (grid) => {
    if (!grid || !Array.isArray(grid) || grid.length === 0) {
        return { columns: [], rows: [], diagonals: [] };
    }
    
    const results = {
        columns: [],
        rows: [],
        diagonals: []
    };
    
    // Tìm số cột tối đa
    const maxCols = Math.max(...grid.map(row => row ? row.length : 0));
    
    // Phân tích từng cột
    for (let col = 0; col < maxCols; col++) {
        const columnPrediction = predictFromColumnBridge(grid, col);
        if (columnPrediction.prediction || columnPrediction.pattern.length > 0) {
            results.columns.push(columnPrediction);
        }
    }
    
    // Phân tích từng hàng
    for (let row = 0; row < grid.length; row++) {
        const rowPrediction = predictFromRowBridge(grid, row);
        if (rowPrediction.prediction || rowPrediction.pattern.length > 0) {
            results.rows.push(rowPrediction);
        }
    }
    
    return results;
};

/**
 * Tạo grid từ dữ liệu đầu vào (từ API hoặc manual)
 * @param {Array<object>} stats - Mảng các object có thuộc tính 'number'
 * @param {number} columnsPerRow - Số cột mỗi hàng (mặc định 7 cho tuần)
 * @returns {Array<Array<string>>} - Grid 2 chiều
 */
export const createGridFromStats = (stats, columnsPerRow = 7) => {
    if (!stats || !Array.isArray(stats)) {
        return [];
    }
    
    const grid = [];
    let currentRow = [];
    
    stats.forEach((stat, index) => {
        const number = stat.number || stat.specialPrize || stat.toString();
        const numStr = String(number);
        
        currentRow.push(numStr);
        
        if (currentRow.length >= columnsPerRow) {
            grid.push([...currentRow]);
            currentRow = [];
        }
    });
    
    // Thêm hàng cuối nếu còn
    if (currentRow.length > 0) {
        grid.push(currentRow);
    }
    
    return grid;
};

export default {
    calculateSpecialInfo,
    getColumnBridge,
    getRowBridge,
    getDiagonalBridge,
    getHeadTailPairing,
    getSumBridge,
    getSumArray,
    findPattern,
    findTouch,
    predictFromColumnBridge,
    predictFromRowBridge,
    findAllBridgeRules,
    createGridFromStats
};

















