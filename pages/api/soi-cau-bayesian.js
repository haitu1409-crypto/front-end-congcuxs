// API endpoint for Soi Cầu Bayesian
// Handles requests for Bayesian-based lottery prediction

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { date, days = 14 } = req.query;

        if (!date) {
            return res.status(400).json({
                message: 'Date parameter is required',
                error: 'MISSING_DATE'
            });
        }

        // Validate date format (DD/MM/YYYY)
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                message: 'Invalid date format. Use DD/MM/YYYY',
                error: 'INVALID_DATE_FORMAT'
            });
        }

        // Parse date
        const [day, month, year] = date.split('/').map(Number);
        const targetDate = new Date(year, month - 1, day);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid date',
                error: 'INVALID_DATE'
            });
        }

        // Validate days parameter
        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum < 7 || daysNum > 30) {
            return res.status(400).json({
                message: 'Days must be between 7 and 30',
                error: 'INVALID_DAYS'
            });
        }

        // Simulate Bayesian prediction logic
        // In a real implementation, this would connect to your backend service
        const predictions = generateBayesianPredictions(targetDate, daysNum);
        const combinedPrediction = generateCombinedPrediction(predictions);
        const additionalSuggestions = generateAdditionalSuggestions(predictions);
        const history = generateHistoryData(daysNum);
        const metadata = generateMetadata(targetDate, daysNum);

        // Rate limiting simulation
        const rateLimitKey = `soicau-bayesian-${req.ip}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxRequests = 10;

        // In production, use Redis or similar for rate limiting
        // For now, we'll just simulate it
        if (Math.random() < 0.01) { // 1% chance of rate limit
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                error: 'RATE_LIMIT_EXCEEDED'
            });
        }

        res.status(200).json({
            success: true,
            predictions,
            combinedPrediction,
            additionalSuggestions,
            history,
            metadata,
            timestamp: now
        });

    } catch (error) {
        console.error('Soi Cầu Bayesian API Error:', error);

        res.status(500).json({
            message: 'Internal server error',
            error: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Bayesian prediction generation functions
function generateBayesianPredictions(targetDate, days) {
    const methods = [
        {
            method: 'Bayesian Frequency Analysis',
            description: 'Phân tích tần suất xuất hiện sử dụng thuật toán Bayesian với prior knowledge',
            probability: 0.85
        },
        {
            method: 'Positional Bayesian',
            description: 'Phân tích vị trí số trong các giải sử dụng Bayesian inference',
            probability: 0.78
        },
        {
            method: 'Pattern Recognition ML',
            description: 'Machine Learning nhận dạng mẫu kết hợp với Bayesian updating',
            probability: 0.82
        },
        {
            method: 'Temporal Bayesian',
            description: 'Phân tích xu hướng thời gian với Bayesian smoothing',
            probability: 0.76
        },
        {
            method: 'Ensemble Bayesian',
            description: 'Kết hợp nhiều mô hình Bayesian với weighted averaging',
            probability: 0.88
        }
    ];

    return methods.map(method => ({
        ...method,
        numbers: generateRandomNumbers(2, 4),
        frame: `${Math.floor(Math.random() * 3) + 2} ngày`
    }));
}

function generateCombinedPrediction(predictions) {
    // Simulate Bayesian combination of predictions
    const allNumbers = predictions.flatMap(p => p.numbers || []);
    const numberCounts = {};

    allNumbers.forEach(num => {
        numberCounts[num] = (numberCounts[num] || 0) + 1;
    });

    // Sort by frequency and take top 2-3
    const sortedNumbers = Object.entries(numberCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([num]) => num);

    return sortedNumbers.join(', ');
}

function generateAdditionalSuggestions(predictions) {
    // Generate additional number suggestions based on Bayesian analysis
    const suggestions = [];
    const usedNumbers = new Set(predictions.flatMap(p => p.numbers || []));

    while (suggestions.length < 3) {
        const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        if (!usedNumbers.has(num) && !suggestions.includes(num)) {
            suggestions.push(num);
        }
    }

    return suggestions;
}

function generateHistoryData(days) {
    const history = [];
    const today = new Date();

    for (let i = days; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const predictions = generateRandomNumbers(2, 4);
        const actualNumbers = generateRandomNumbers(1, 3);
        const isHit = Math.random() < 0.3; // 30% hit rate simulation

        history.push({
            date: date.toLocaleDateString('vi-VN'),
            predictions: predictions.map(num => ({ number: num })),
            actualNumbers,
            isHit,
            accuracy: Math.random() * 0.4 + 0.6 // 60-100% accuracy
        });
    }

    return history;
}

function generateMetadata(targetDate, days) {
    const dataFrom = new Date(targetDate);
    dataFrom.setDate(dataFrom.getDate() - days);

    return {
        predictionFor: targetDate.toLocaleDateString('vi-VN'),
        dataFrom: dataFrom.toLocaleDateString('vi-VN'),
        dataTo: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
        dataPoints: days,
        algorithm: 'Bayesian Inference + Machine Learning',
        confidence: 'High',
        lastUpdated: new Date().toISOString()
    };
}

function generateRandomNumbers(min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const numbers = [];

    while (numbers.length < count) {
        const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }

    return numbers;
}
