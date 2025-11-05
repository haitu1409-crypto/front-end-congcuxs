/**
 * MessageModal Component - Modal để sửa/xóa tin nhắn
 */

import { useState, useEffect, useRef } from 'react';
import { X, Edit2, Trash2, Loader2 } from 'lucide-react';
import styles from '../../styles/MessageModal.module.css';

export default function MessageModal({ 
    isOpen, 
    onClose, 
    message, 
    currentUserId, 
    isAdmin,
    onMessageEdited,
    onMessageDeleted,
    roomId,
    deleteMessage,
    editMessage
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (message) {
            setEditContent(message.content || '');
            setIsEditing(false);
            setError(null);
        }
    }, [message]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Auto-resize textarea
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [isEditing]);

    if (!isOpen || !message) return null;

    const messageId = message.id || message._id;
    const isOwner = message.senderId === currentUserId;
    // User can only edit/delete their own messages, admin can edit/delete any message
    const canEdit = isAdmin || isOwner;
    const canDelete = isAdmin || isOwner;

    // Check if user can edit/delete (5 minutes for non-admin)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    const canEditByTime = isAdmin || (isOwner && messageAge <= fiveMinutes);
    const canDeleteByTime = isAdmin || (isOwner && messageAge <= fiveMinutes);

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(message.content || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(message.content || '');
        setError(null);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            setError('Nội dung tin nhắn không được để trống');
            return;
        }

        if (editContent.length > 5000) {
            setError('Tin nhắn không được vượt quá 5000 ký tự');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (!editMessage) {
                throw new Error('Edit message function not available');
            }

            // Use socket for real-time updates
            await editMessage(roomId, messageId, editContent.trim());
            
            setIsEditing(false);
            // Message will be updated via socket event, no need to call onMessageEdited
            onClose();
        } catch (err) {
            setError(err.message || 'Lỗi khi sửa tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!deleteMessage) {
                throw new Error('Delete message function not available');
            }

            // Use socket for real-time updates
            await deleteMessage(roomId, messageId);
            
            // Message will be removed via socket event, no need to call onMessageDeleted
            onClose();
        } catch (err) {
            setError(err.message || 'Lỗi khi xóa tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const handleTextareaChange = (e) => {
        setEditContent(e.target.value);
        setError(null);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEditing ? 'Sửa tin nhắn' : 'Tin nhắn'}</h3>
                    <button className={styles.closeButton} onClick={onClose} disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {isEditing ? (
                        <div className={styles.editContainer}>
                            <textarea
                                ref={textareaRef}
                                className={styles.editTextarea}
                                value={editContent}
                                onChange={handleTextareaChange}
                                disabled={loading}
                                maxLength={5000}
                                rows={4}
                            />
                            <div className={styles.editActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSaveEdit}
                                    disabled={loading || !editContent.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className={styles.spinner} />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'Lưu'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
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
                    )}
                </div>

                {!isEditing && (
                    <div className={styles.modalFooter}>
                        {canEdit && canEditByTime && (
                            <button
                                className={styles.editButton}
                                onClick={handleEdit}
                                disabled={loading}
                            >
                                <Edit2 size={16} />
                                Sửa
                            </button>
                        )}
                        {canEdit && !canEditByTime && !isAdmin && (
                            <div className={styles.disabledHint}>
                                Chỉ có thể sửa trong vòng 5 phút sau khi gửi
                            </div>
                        )}
                        {canDelete && canDeleteByTime && (
                            <button
                                className={styles.deleteButton}
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className={styles.spinner} />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Xóa
                                    </>
                                )}
                            </button>
                        )}
                        {canDelete && !canDeleteByTime && !isAdmin && (
                            <div className={styles.disabledHint}>
                                Chỉ có thể xóa trong vòng 5 phút sau khi gửi
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

