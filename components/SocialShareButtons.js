import { useState } from 'react';
import { 
    Facebook, 
    Twitter, 
    Linkedin, 
    MessageCircle, 
    Send, 
    Link2, 
    Check,
    Share2 
} from 'lucide-react';
import styles from '../styles/SocialShareButtons.module.css';

const SocialShareButtons = ({ 
    url, 
    title, 
    description = '', 
    image = '',
    hashtags = [],
    compact = false 
}) => {
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Encode URL and text for sharing
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const hashtagsStr = hashtags.join(',');

    // Social sharing functions
    const shareToFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
            'facebook-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashtagsStr ? `&hashtags=${hashtagsStr}` : ''}`;
        window.open(
            twitterUrl,
            'twitter-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const shareToLinkedIn = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            'linkedin-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const shareToZalo = () => {
        window.open(
            `https://zalo.me/share?url=${encodedUrl}`,
            'zalo-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const shareToTelegram = () => {
        window.open(
            `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            'telegram-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const shareToWhatsApp = () => {
        const text = `${title}\n${url}`;
        const encodedText = encodeURIComponent(text);
        window.open(
            `https://wa.me/?text=${encodedText}`,
            'whatsapp-share',
            'width=600,height=400,toolbar=0,menubar=0,location=0'
        );
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setShowToast(true);
            
            // Reset after 2 seconds
            setTimeout(() => {
                setCopied(false);
                setShowToast(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setShowToast(true);
                setTimeout(() => {
                    setCopied(false);
                    setShowToast(false);
                }, 2000);
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareViaNavigator = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const buttons = [
        {
            name: 'Facebook',
            icon: <Facebook size={compact ? 16 : 18} />,
            onClick: shareToFacebook,
            className: styles.facebook,
            ariaLabel: 'Chia sẻ lên Facebook'
        },
        {
            name: 'Twitter',
            icon: <Twitter size={compact ? 16 : 18} />,
            onClick: shareToTwitter,
            className: styles.twitter,
            ariaLabel: 'Chia sẻ lên Twitter'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={compact ? 16 : 18} />,
            onClick: shareToLinkedIn,
            className: styles.linkedin,
            ariaLabel: 'Chia sẻ lên LinkedIn'
        },
        {
            name: 'Zalo',
            icon: <MessageCircle size={compact ? 16 : 18} />,
            onClick: shareToZalo,
            className: styles.zalo,
            ariaLabel: 'Chia sẻ lên Zalo'
        },
        {
            name: 'Telegram',
            icon: <Send size={compact ? 16 : 18} />,
            onClick: shareToTelegram,
            className: styles.telegram,
            ariaLabel: 'Chia sẻ lên Telegram'
        },
        {
            name: copied ? 'Đã sao chép!' : 'Copy link',
            icon: copied ? <Check size={compact ? 16 : 18} /> : <Link2 size={compact ? 16 : 18} />,
            onClick: copyLink,
            className: `${styles.copy} ${copied ? styles.copied : ''}`,
            ariaLabel: 'Sao chép liên kết'
        }
    ];

    return (
        <div className={`${styles.socialShare} ${compact ? styles.compact : ''}`}>
            {!compact && <h3 className={styles.shareTitle}>Chia sẻ bài viết:</h3>}
            
            <div className={styles.shareButtons}>
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        className={`${styles.shareButton} ${button.className}`}
                        onClick={button.onClick}
                        aria-label={button.ariaLabel}
                        title={button.ariaLabel}
                    >
                        {button.icon}
                        {!compact && <span>{button.name}</span>}
                    </button>
                ))}
                
                {/* Native Share Button (Mobile) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                        className={`${styles.shareButton} ${styles.native}`}
                        onClick={shareViaNavigator}
                        aria-label="Chia sẻ"
                        title="Chia sẻ"
                    >
                        <Share2 size={compact ? 16 : 18} />
                        {!compact && <span>Chia sẻ</span>}
                    </button>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className={styles.toast}>
                    <Check size={16} />
                    <span>Đã sao chép liên kết!</span>
                </div>
            )}
        </div>
    );
};

export default SocialShareButtons;
