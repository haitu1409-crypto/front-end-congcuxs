/**
 * Chat QR Code Component - Hiển thị QR code cho page chat dưới dạng modal
 */

import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, X } from 'lucide-react';
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
                        <button
                            onClick={handleCopy}
                            className={styles.copyButton}
                            title="Sao chép link"
                        >
                            {copied ? (
                                <>
                                    <Check size={16} />
                                    <span>Đã sao chép!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>Sao chép link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

