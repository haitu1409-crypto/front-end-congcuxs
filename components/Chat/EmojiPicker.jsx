/**
 * EmojiPicker Component - Bộ chọn emoji
 */

import { useState } from 'react';
import { Smile } from 'lucide-react';
import styles from '../../styles/EmojiPicker.module.css';

const EMOJI_CATEGORIES = {
    'Phổ biến': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Cảm xúc': ['😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'],
    'Hand': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎'],
    'Heart': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Symbol': ['✅', '❌', '⭐', '🌟', '💯', '🔥', '💪', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🎯', '🎲', '🎮', '🎰', '🎸']
};

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }) {
    const [activeCategory, setActiveCategory] = useState('Phổ biến');

    const handleEmojiClick = (emoji, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEmojiSelect) {
            onEmojiSelect(emoji);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.emojiPicker}>
            <div className={styles.emojiPickerHeader}>
                <div className={styles.emojiCategories}>
                    {Object.keys(EMOJI_CATEGORIES).map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveCategory(category);
                            }}
                            title={category}
                        >
                            {category === 'Phổ biến' && <Smile size={16} />}
                            {category === 'Heart' && '❤️'}
                            {category === 'Hand' && '👋'}
                            {category === 'Cảm xúc' && '😊'}
                            {category === 'Symbol' && '⭐'}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.emojiPickerBody}>
                <div className={styles.emojiGrid}>
                    {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                        <button
                            key={`${activeCategory}-${index}`}
                            type="button"
                            className={styles.emojiButton}
                            onClick={(e) => handleEmojiClick(emoji, e)}
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

