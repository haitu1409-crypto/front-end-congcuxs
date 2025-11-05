/**
 * Chat QR Code Component - Hiển thị QR code cho page chat dưới dạng modal
 */

import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, X, Facebook, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from '../../styles/ChatQRCode.module.css';

export default function ChatQRCode({ isOpen, onClose }) {
    const [copied, setCopied] = useState(false);
    
    // Use production URL for QR code (so users can scan from anywhere)
    const productionUrl = 'https://www.taodandewukong.pro';
    const chatUrl = typeof window !== 'undefined' 
        ? (process.env.NODE_ENV === 'production' 
            ? `${productionUrl}/chat` 
            : `${window.location.origin}/chat`)
        : '/chat';

    const handleCopy = () => {
        navigator.clipboard.writeText(chatUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleShareFacebook = () => {
        // Facebook Share - sẽ crawl Open Graph tags từ /chat page
        // OG image sẽ là QR code được generate từ qr-server.com API
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(chatUrl)}&hashtag=%23DànĐềWukong`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const handleShareTelegram = () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(chatUrl)}&text=${encodeURIComponent('Group Chat Chốt Dàn 3 Miền Wukong')}`;
        window.open(telegramUrl, '_blank', 'width=600,height=400');
    };

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <QrCode size={20} />
                        <h3>Quét QR để vào Chat</h3>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="Đóng"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.qrCodeWrapper}>
                        <QRCodeSVG
                            value={chatUrl}
                            size={250}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: '/imgs/monkey.png',
                                height: 60,
                                width: 60,
                                excavate: true,
                            }}
                        />
                    </div>
                    <h4 className={styles.qrCodeTitle}>Group Chat Chốt Dàn 3 Miền Wukong</h4>
                    <div className={styles.qrCodeInfo}>
                        <p className={styles.qrCodeUrl}>{chatUrl}</p>
                        <div className={styles.shareButtons}>
                            <button
                                onClick={handleCopy}
                                className={styles.shareButton}
                                title={copied ? "Đã sao chép!" : "Sao chép liên kết"}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                            <button
                                onClick={handleShareFacebook}
                                className={styles.shareButton}
                                title="Chia sẻ lên Facebook"
                            >
                                <Facebook size={18} />
                            </button>
                            <button
                                onClick={handleShareTelegram}
                                className={styles.shareButton}
                                title="Chia sẻ lên Telegram"
                            >
                                {/* Telegram icon - using Send icon from lucide */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2l-7 20-4-9-9-4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

