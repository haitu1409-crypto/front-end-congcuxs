/**
 * MessageInput Component - Input để gửi tin nhắn
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import styles from '../../styles/MessageInput.module.css';

export default function MessageInput({ onSend, onTyping, onStopTyping, sending, disabled, mentions = [], onCancelMentions }) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiButtonRef = useRef(null);

    // Handle input change
    const handleChange = (e) => {
        setMessage(e.target.value);
        
        // Trigger typing
        if (e.target.value.trim() && onTyping) {
            onTyping();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            if (onStopTyping) {
                onStopTyping();
            }
        }, 3000);
    };

    // Handle send
    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || sending || disabled) return;

        onSend(message, null, mentions);
        setMessage('');
        
        // Reset textarea height and overflow to initial state
        if (inputRef.current) {
            inputRef.current.style.height = '40px';
            inputRef.current.style.overflowY = 'hidden';
        }
        
        if (onCancelMentions) {
            onCancelMentions();
        }
        if (onStopTyping) {
            onStopTyping();
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    // Reset textarea height and overflow when message is cleared
    useEffect(() => {
        if (!message && inputRef.current) {
            inputRef.current.style.height = '40px';
            inputRef.current.style.overflowY = 'hidden';
        }
    }, [message]);

    // Focus input when mentions change
    useEffect(() => {
        if (mentions.length > 0) {
            inputRef.current?.focus();
        }
    }, [mentions]);

    // Auto-add @username to content when mentions are added
    useEffect(() => {
        if (mentions.length > 0 && inputRef.current) {
            const lastMention = mentions[mentions.length - 1];
            const displayName = lastMention.displayName || lastMention.username;
            const mentionText = `@${displayName} `;
            
            // Only add if not already in content
            if (!message.includes(mentionText.trim())) {
                const currentValue = inputRef.current.value;
                const cursorPos = inputRef.current.selectionStart;
                const newValue = currentValue.slice(0, cursorPos) + mentionText + currentValue.slice(cursorPos);
                setMessage(newValue);
                
                // Set cursor position after mention
                setTimeout(() => {
                    const newCursorPos = cursorPos + mentionText.length;
                    inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
            }
        }
    }, [mentions.length]); // Only trigger when mentions count changes

    // Handle emoji select
    const handleEmojiSelect = (emoji) => {
        if (inputRef.current) {
            const currentValue = inputRef.current.value;
            const cursorPos = inputRef.current.selectionStart;
            const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
            setMessage(newValue);
            
            // Set cursor position after emoji
            setTimeout(() => {
                const newCursorPos = cursorPos + emoji.length;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                inputRef.current.focus();
            }, 0);
            
            // Trigger typing indicator
            if (onTyping) {
                onTyping();
            }
        }
        // Note: Don't close emoji picker automatically - let user select multiple emojis
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker) {
                const emojiPickerEl = document.querySelector('[class*="emojiPicker"]');
                if (
                    emojiButtonRef.current &&
                    !emojiButtonRef.current.contains(event.target) &&
                    emojiPickerEl &&
                    !emojiPickerEl.contains(event.target)
                ) {
                    setShowEmojiPicker(false);
                }
            }
        };

        if (showEmojiPicker) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
        // Shift+Enter will create new line (default behavior)
    };

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <form className={styles.messageInput} onSubmit={handleSend}>
            {/* Mentions preview */}
            {mentions.length > 0 && (
                <div className={styles.mentionsPreview}>
                    <div className={styles.mentionsInfo}>
                        <div className={styles.mentionsLabel}>Đang tag</div>
                        <div className={styles.mentionsList}>
                            {mentions.map((mention, index) => (
                                <span key={index} className={styles.mentionTag}>
                                    @{mention.displayName || mention.username}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.cancelMentionsButton}
                        onClick={onCancelMentions}
                        title="Hủy tag"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                    <button
                        type="button"
                        ref={emojiButtonRef}
                        className={styles.emojiButton}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Emoji"
                        disabled={disabled || sending}
                    >
                        <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                        <div className={styles.emojiPickerWrapper}>
                            <EmojiPicker
                                onEmojiSelect={handleEmojiSelect}
                                isOpen={showEmojiPicker}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        </div>
                    )}
                </div>
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder={disabled ? "Đang kết nối..." : "Nhập tin nhắn..."}
                    className={styles.input}
                    disabled={disabled || sending}
                    maxLength={5000}
                    rows={1}
                    style={{
                        resize: 'none',
                        minHeight: '40px',
                        maxHeight: '120px'
                    }}
                    onInput={(e) => {
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        const newHeight = Math.min(e.target.scrollHeight, 120);
                        e.target.style.height = `${newHeight}px`;
                        
                        // Show scroll when reaching max height
                        if (newHeight >= 120) {
                            e.target.style.overflowY = 'auto';
                        } else {
                            e.target.style.overflowY = 'hidden';
                        }
                    }}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!message.trim() || sending || disabled}
                    title="Gửi (Enter)"
                >
                    {sending ? (
                        <Loader2 size={18} className={styles.spinner} />
                    ) : (
                        <Send size={18} />
                    )}
                </button>
            </div>
        </form>
    );
}

