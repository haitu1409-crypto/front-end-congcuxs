import { useEffect, useMemo } from 'react';
import { chatGifs, getChatGifUrl } from '../../lib/chatGifs';
import styles from '../../styles/GifPicker.module.css';

export default function GifPicker({ isOpen, onGifSelect, onClose }) {
    const filteredGifs = useMemo(() => chatGifs, []);

    const handleSelect = (gif) => {
        if (!gif) return;
        onGifSelect?.(gif);
    };

    const handleKeyDown = (event, gif) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect(gif);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscKey, true);
        return () => {
            document.removeEventListener('keydown', handleEscKey, true);
        };
    }, [isOpen, onClose]);

    return (
        <div className={styles.gifPicker} role="dialog" aria-label="Chọn GIF động">
            <div className={styles.grid} role="list">
                {filteredGifs.map((gif) => {
                    const gifUrl = getChatGifUrl(gif);
                    return (
                        <button
                            key={gif.id}
                            type="button"
                            role="listitem"
                            className={styles.gifButton}
                            onClick={() => handleSelect(gif)}
                            onKeyDown={(event) => handleKeyDown(event, gif)}
                        >
                            <span className={styles.gifThumbnail}>
                                <img
                                    src={gifUrl}
                                    alt={gif.label}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </span>
                        </button>
                    );
                })}
            </div>
            {filteredGifs.length === 0 && (
                <div className={styles.emptyState}>Không tìm thấy GIF phù hợp.</div>
            )}
        </div>
    );
}


