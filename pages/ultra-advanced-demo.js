/**
 * Ultra Advanced Soi Cầu Demo Page
 * Trang demo cho thuật toán soi cầu cực kỳ cao siêu
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/SoiCau.module.css';
import moment from 'moment';

export default function UltraAdvancedDemo() {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    const generateUltraAdvancedPredictions = async () => {
        setLoading(true);
        setError(null);

        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];

            console.log('🧠 Generating Ultra Advanced AI Soi Cầu...');

            const response = await fetch(`/api/ultra-advanced-soicau/predict/${dateStr}/de`);
            const result = await response.json();

            if (result.success) {
                setPredictions(result.data);
                console.log('✅ Ultra Advanced predictions generated:', result.data);
            } else {
                throw new Error(result.message || 'Lỗi khi tạo Ultra Advanced predictions');
            }
        } catch (err) {
            console.error('❌ Ultra Advanced Error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDetailedAnalysis = async () => {
        if (!predictions) return;

        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];

            const response = await fetch(`/api/ultra-advanced-soicau/analysis/${dateStr}/de`);
            const result = await response.json();

            if (result.success) {
                setAnalysis(result.data);
                console.log('✅ Detailed analysis retrieved:', result.data);
            }
        } catch (err) {
            console.error('❌ Analysis Error:', err.message);
        }
    };

    useEffect(() => {
        if (predictions && !analysis) {
            getDetailedAnalysis();
        }
    }, [predictions]);

    const renderPredictionCard = (prediction, index) => {
        const isTop3 = index < 3;
        const cardClass = isTop3 ? styles.topPrediction : styles.prediction;

        const probability = parseFloat(prediction.percentage) || 0;
        let confidenceLevel = 'Thấp';
        let confidenceColor = '#dc3545';
        let confidenceIcon = '🌱';

        if (probability >= 10.0) {
            confidenceLevel = 'Rất Cao';
            confidenceColor = '#28a745';
            confidenceIcon = '🔥';
        } else if (probability >= 7.0) {
            confidenceLevel = 'Cao';
            confidenceColor = '#17a2b8';
            confidenceIcon = '⭐';
        } else if (probability >= 4.0) {
            confidenceLevel = 'Trung Bình';
            confidenceColor = '#ffc107';
            confidenceIcon = '💫';
        }

        return (
            <div key={prediction.number} className={cardClass}>
                <div className={styles.predictionNumber}>
                    {prediction.number}
                </div>
                <div className={styles.predictionPercentage}>
                    {prediction.percentage}%
                </div>
                {isTop3 && (
                    <div className={styles.topBadge}>
                        Top {index + 1}
                    </div>
                )}
                <div style={{
                    fontSize: '11px',
                    color: confidenceColor,
                    marginTop: '4px',
                    fontWeight: 'bold'
                }}>
                    {confidenceIcon} {confidenceLevel}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Ultra Advanced AI Soi Cầu Demo - Đỉnh Cao Của Thuật Toán</title>
                <meta name="description" content="Demo thuật toán soi cầu cực kỳ cao siêu với AI, Neural Networks, Quantum Computing" />
            </Head>

            <div className={styles.header}>
                <h1 className={styles.title}>
                    🧠 Ultra Advanced AI Soi Cầu v2.0
                </h1>
                <p className={styles.subtitle}>
                    Thuật toán soi cầu cực kỳ cao siêu với 10 phương pháp AI tiên tiến
                </p>
            </div>

            <div className={styles.features}>
                <h2>🚀 Tính Năng Ultra Advanced</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <h3>🧠 Deep Learning</h3>
                        <p>Pattern Recognition, RNN, CNN, Transformer</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>⚛️ Quantum Computing</h3>
                        <p>Quantum-inspired probability calculation</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🧬 Genetic Algorithm</h3>
                        <p>50 generations optimization</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🌀 Chaos Theory</h3>
                        <p>Lorenz, Mandelbrot, Strange Attractors</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🔮 Fractal Analysis</h3>
                        <p>Mandelbrot, Julia sets, Fractal dimensions</p>
                    </div>
                    <div className={styles.featureCard}>
                        <h3>🎯 Meta-Learning</h3>
                        <p>Learn how to learn better</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <button
                    onClick={generateUltraAdvancedPredictions}
                    disabled={loading}
                    className={styles.generateButton}
                >
                    {loading ? '🧠 Đang xử lý AI...' : '🚀 Tạo Ultra Advanced Predictions'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    ❌ {error}
                </div>
            )}

            {predictions && (
                <div className={styles.results}>
                    <h2>📊 Ultra Advanced Results</h2>

                    <div className={styles.metadata}>
                        <div className={styles.metadataItem}>
                            <strong>Algorithm:</strong> {predictions.metadata.algorithm}
                        </div>
                        <div className={styles.metadataItem}>
                            <strong>Version:</strong> {predictions.metadata.version}
                        </div>
                        <div className={styles.metadataItem}>
                            <strong>Confidence:</strong> {predictions.metadata.confidence}%
                        </div>
                        <div className={styles.metadataItem}>
                            <strong>Accuracy:</strong> {predictions.metadata.accuracy}%
                        </div>
                        <div className={styles.metadataItem}>
                            <strong>Uniqueness:</strong> {predictions.metadata.uniqueness}%
                        </div>
                        <div className={styles.metadataItem}>
                            <strong>Complexity:</strong> {predictions.metadata.complexity}%
                        </div>
                    </div>

                    <div className={styles.aiMethods}>
                        <h3>🤖 AI Methods Applied: {predictions.metadata.aiMethods}</h3>
                        <div className={styles.methodsList}>
                            <span className={styles.methodTag}>Deep Learning</span>
                            <span className={styles.methodTag}>RNN</span>
                            <span className={styles.methodTag}>CNN</span>
                            <span className={styles.methodTag}>Transformer</span>
                            <span className={styles.methodTag}>Bayesian NN</span>
                            <span className={styles.methodTag}>Reinforcement</span>
                            <span className={styles.methodTag}>Ensemble</span>
                            <span className={styles.methodTag}>Meta-Learning</span>
                            <span className={styles.methodTag}>Adversarial</span>
                            <span className={styles.methodTag}>Quantum ML</span>
                        </div>
                    </div>

                    <div className={styles.predictions}>
                        <h3>🎯 Top Predictions</h3>
                        <div className={styles.predictionGrid}>
                            {predictions.predictions.map((prediction, index) =>
                                renderPredictionCard(prediction, index)
                            )}
                        </div>
                    </div>
                </div>
            )}

            {analysis && (
                <div className={styles.analysis}>
                    <h2>🔬 Detailed Analysis</h2>

                    <div className={styles.analysisGrid}>
                        <div className={styles.analysisCard}>
                            <h4>🧠 Deep Features</h4>
                            <p>Temporal: {analysis.features.deepFeatures} features</p>
                            <p>Frequency: {analysis.features.frequency} features</p>
                            <p>Patterns: {analysis.features.patterns} features</p>
                        </div>

                        <div className={styles.analysisCard}>
                            <h4>⚛️ Quantum Analysis</h4>
                            <p>Quantum Probs: {analysis.features.quantumProbs} numbers</p>
                            <p>Neural Layers: {analysis.features.neuralLayers}</p>
                            <p>Genetic Pop: {analysis.features.geneticPopulation}</p>
                        </div>

                        <div className={styles.analysisCard}>
                            <h4>🌀 Chaos & Fractal</h4>
                            <p>Chaos Attractors: {analysis.features.chaosAttractors}</p>
                            <p>Fractal Dims: {analysis.features.fractalDimensions}</p>
                            <p>AI Methods: {analysis.features.aiAnalysis}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <p>🧠 Ultra Advanced AI Soi Cầu v2.0 - Đỉnh cao của thuật toán soi cầu</p>
                <p>Powered by 10 AI methods, Neural Networks, Quantum Computing, Genetic Algorithm, Chaos Theory & Fractal Analysis</p>
            </div>
        </div>
    );
}


