/**
 * MessageActionModal Component - Modal với submenu cho các hành động tin nhắn
 * Optimized for performance
 */

import { useState, useEffect, useRef } from 'react';
import { X, Reply, Copy, Edit2, Trash2, Loader2, Check } from 'lucide-react';
import styles from '../../styles/MessageActionModal.module.css';

export default function MessageActionModal({ 
    isOpen, 
    onClose, 
    message, 
    currentUserId, 
    isAdmin,
    onReply,
    onEdit,
    onDelete,
    editing,
    deleting
}) {
    const modalRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // Close modal when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Add listeners with small delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 100);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !message) return null;

    const messageId = message.id || message._id;
    const isOwner = message.senderId === currentUserId;
    
    // Check time limits (5 minutes for non-admin, unlimited for admin)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    const canEditByTime = isAdmin || (isOwner && messageAge <= fiveMinutes);
    const canDeleteByTime = isAdmin || (isOwner && messageAge <= fiveMinutes);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content || '');
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleReply = () => {
        if (onReply) {
            onReply(message);
        }
        onClose();
    };

    const handleEdit = () => {
        if (onEdit && canEditByTime && !editing) {
            onEdit(message);
        }
    };

    const handleDelete = () => {
        if (onDelete && canDeleteByTime && !deleting) {
            onDelete(message);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div 
                className={styles.modalContent} 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3>Hành động</h3>
                    <button 
                        className={styles.closeButton} 
                        onClick={onClose}
                        disabled={editing || deleting}
                        aria-label="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.messagePreview}>
                        <div className={styles.messageContent}>
                            {message.content}
                        </div>
                        {message.isEdited && (
                            <div className={styles.editedLabel}>
                                (Đã sửa)
                            </div>
                        )}
                    </div>

                    <div className={styles.actionMenu}>
                        {/* Reply - Available for all messages */}
                        <button
                            className={styles.actionButton}
                            onClick={handleReply}
                            disabled={editing || deleting}
                        >
                            <Reply size={18} />
                            <span>Trả lời</span>
                        </button>

                        {/* Copy - Available for all messages */}
                        <button
                            className={styles.actionButton}
                            onClick={handleCopy}
                            disabled={editing || deleting}
                        >
                            {copied ? (
                                <>
                                    <Check size={18} />
                                    <span>Đã sao chép</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    <span>Sao chép</span>
                                </>
                            )}
                        </button>

                        {/* Edit - Only for own messages within 30s or admin */}
                        {canEditByTime && (
                            <button
                                className={styles.actionButton}
                                onClick={handleEdit}
                                disabled={editing || deleting}
                            >
                                {editing ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        <span>Đang sửa...</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 size={18} />
                                        <span>Sửa</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Delete - Only for own messages within 30s or admin */}
                        {canDeleteByTime && (
                            <button
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={handleDelete}
                                disabled={editing || deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        <span>Đang xóa...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        <span>Xóa</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Time limit hint for non-admin */}
                        {!isAdmin && isOwner && !canEditByTime && (
                            <div className={styles.timeLimitHint}>
                                Chỉ có thể sửa/xóa trong vòng 5 phút sau khi gửi
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

