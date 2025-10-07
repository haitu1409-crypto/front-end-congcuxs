/**
 * WukongSlider - Slider tối ưu hiệu suất với 4 ảnh Wukong
 * Mỗi ảnh tương ứng với một page khác nhau
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import styles from '../styles/WukongSlider.module.css';

const WukongSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const intervalRef = useRef(null);
    const sliderRef = useRef(null);

    // Slider data với links tương ứng
    const slides = [
        {
            id: 1,
            image: '/imgs/wukong1.png',
            title: 'Dàn Đề 9x-0x',
            description: 'Tạo dàn đề 9x-0x chuyên nghiệp',
            link: '/dan-9x0x',
            alt: 'Wukong 1 - Dàn đề 9x-0x'
        },
        {
            id: 2,
            image: '/imgs/wukong2.png',
            title: 'Dàn 2D',
            description: 'Dàn đề 2 chữ số (00-99)',
            link: '/dan-2d',
            alt: 'Wukong 2 - Dàn 2D'
        },
        {
            id: 3,
            image: '/imgs/wukong3.png',
            title: 'Dàn 3D/4D',
            description: 'Dàn đề 3-4 chữ số',
            link: '/dan-3d4d',
            alt: 'Wukong 3 - Dàn 3D/4D'
        },
        {
            id: 4,
            image: '/imgs/wukong4.png',
            title: 'Thống Kê',
            description: 'Thống kê xổ số 3 miền',
            link: '/thong-ke',
            alt: 'Wukong 4 - Thống kê'
        }
    ];

    // Auto-play functionality
    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 4000); // 4 seconds per slide
    }, [slides.length]);

    const stopAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Initialize auto-play
    useEffect(() => {
        if (isAutoPlay && isLoaded) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }

        return () => stopAutoPlay();
    }, [isAutoPlay, isLoaded, startAutoPlay, stopAutoPlay]);

    // Navigation functions
    const goToSlide = useCallback((index) => {
        setCurrentSlide(index);
        if (isAutoPlay) {
            stopAutoPlay();
            setTimeout(() => startAutoPlay(), 100);
        }
    }, [isAutoPlay, startAutoPlay, stopAutoPlay]);

    const nextSlide = useCallback(() => {
        goToSlide((currentSlide + 1) % slides.length);
    }, [currentSlide, slides.length, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }, [currentSlide, slides.length, goToSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                setIsAutoPlay(!isAutoPlay);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [prevSlide, nextSlide, isAutoPlay]);

    // Touch/swipe support
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) nextSlide();
        if (isRightSwipe) prevSlide();
    };

    // Preload images for better performance
    useEffect(() => {
        const preloadImages = () => {
            slides.forEach(slide => {
                const img = new window.Image();
                img.src = slide.image;
            });
            setIsLoaded(true);
        };

        preloadImages();
    }, [slides]);

    return (
        <div className={styles.sliderContainer}>
            <div className={styles.sliderHeader}>
                <h2 className={styles.sliderTitle}>
                 
                    Tôn Ngộ Không & Công Cụ
                </h2>
                <p className={styles.sliderDescription}>
                    Khám phá các công cụ tạo dàn đề chuyên nghiệp
                </p>
            </div>

            <div 
                className={styles.slider}
                ref={sliderRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Slides */}
                <div 
                    className={styles.slidesContainer}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={slide.id} className={styles.slide}>
                            <Link href={slide.link} className={styles.slideLink}>
                                <div className={styles.imageContainer}>
                                    <Image
                                        src={slide.image}
                                        alt={slide.alt}
                                        width={400}
                                        height={300}
                                        className={styles.slideImage}
                                        priority={index === 0} // Prioritize first image
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                    <div className={styles.slideOverlay}>
                                        <div className={styles.slideContent}>
                                            <h3 className={styles.slideTitle}>{slide.title}</h3>
                                            <p className={styles.slideDescription}>{slide.description}</p>
                                            <div className={styles.slideButton}>
                                                Khám phá ngay →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button 
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Dots Indicator */}
                <div className={styles.dotsContainer}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Auto-play Control */}
                <button 
                    className={styles.autoPlayButton}
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
                >
                    {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
                </button>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
                <div 
                    className={styles.progressBar}
                    style={{ 
                        width: `${((currentSlide + 1) / slides.length) * 100}%`,
                        animation: isAutoPlay ? 'progress 4s linear infinite' : 'none'
                    }}
                />
            </div>
        </div>
    );
};

export default WukongSlider;
