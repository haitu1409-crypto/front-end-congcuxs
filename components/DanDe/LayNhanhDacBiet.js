/**
 * LayNhanhDacBiet Component
 * Lấy nhanh dàn đặc biệt theo các bộ lọc
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Copy, AlertTriangle, CheckCircle, XCircle, Zap, Check, Layers } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const FILTERS = {
    dau: ['Đầu chẵn', 'Đầu lẻ', 'Đầu bé', 'Đầu lớn'],
    duoi: ['Đuôi chẵn', 'Đuôi lẻ', 'Đuôi bé', 'Đuôi lớn'],
    tong: ['Tổng chẵn', 'Tổng lẻ', 'Tổng bé', 'Tổng lớn'],
    dauDuoi: ['Chẵn/Chẵn', 'Chẵn/Lẻ', 'Lẻ/Chẵn', 'Lẻ/Lẻ'],
    beLon: ['Bé/Bé', 'Bé/Lớn', 'Lớn/Bé', 'Lớn/Lớn'],
    kep: ['Kép bằng', 'Kép lệch', 'Kép âm', 'Sát kép'],
    hieu: ['Hiệu 0', 'Hiệu 1', 'Hiệu 2', 'Hiệu 3', 'Hiệu 4', 'Hiệu 5', 'Hiệu 6', 'Hiệu 7', 'Hiệu 8', 'Hiệu 9', 'Hiệu chẵn', 'Hiệu lẻ'],
    conGiap: ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']
};

const HIEU_SETS = {
    'Hiệu 0': '00,11,22,33,44,55,66,77,88,99',
    'Hiệu 1': '09,10,21,32,43,54,65,76,87,98',
    'Hiệu 2': '08,19,20,31,42,53,64,75,86,97',
    'Hiệu 3': '07,18,29,30,41,52,63,74,85,96',
    'Hiệu 4': '06,17,28,39,40,51,62,73,84,95',
    'Hiệu 5': '05,16,27,38,49,50,61,72,83,94',
    'Hiệu 6': '04,15,26,37,48,59,60,71,82,93',
    'Hiệu 7': '03,14,25,36,47,58,69,70,81,92',
    'Hiệu 8': '02,13,24,35,46,57,68,79,80,91',
    'Hiệu 9': '01,12,23,34,45,56,67,78,89,90',
    'Hiệu chẵn': '00,55,11,66,22,77,33,88,44,99,02,20,13,31,24,42,35,53,46,64,57,75,68,86,79,97,04,40,15,51,26,62,37,73,48,84,59,95,06,60,17,71,28,82,39,93,08,80,19,91',
    'Hiệu lẻ': '01,10,12,21,23,32,34,43,45,54,56,65,67,76,78,87,89,98,03,30,14,41,25,52,36,63,47,74,58,85,69,96,05,50,16,61,27,72,38,83,49,94,07,70,18,81,29,92,09,90',
    'Tý': '00,12,24,36,48,60,72,84,96',
    'Sửu': '01,13,25,37,49,61,73,85,97',
    'Dần': '02,14,26,38,50,62,74,86,98',
    'Mão': '03,15,27,39,51,63,75,87,99',
    'Thìn': '04,16,28,40,52,64,76,88',
    'Tỵ': '05,17,29,41,53,65,77,89',
    'Ngọ': '06,18,30,42,54,66,78,90',
    'Mùi': '07,19,31,43,55,67,79,91',
    'Thân': '08,20,32,44,56,68,80,92',
    'Dậu': '09,21,33,45,57,69,81,93',
    'Tuất': '10,22,34,46,58,70,82,94',
    'Hợi': '11,23,35,47,59,71,83,95'
};

export default function LayNhanhDacBiet() {
    const [selectedFilter, setSelectedFilter] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [copyStatus, setCopyStatus] = useState(false);
    const [filterStatus, setFilterStatus] = useState({});

    // Refs để cleanup setTimeout
    const timeoutRefs = useRef([]);

    // Cleanup timeouts khi component unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(timeoutId => {
                if (timeoutId) clearTimeout(timeoutId);
            });
            timeoutRefs.current = [];
        };
    }, []);

    const handleFilterClick = async (filter) => {
        setSelectedFilter(filter);
        setLoading(true);

        try {
            // Check if it's a hiệu filter
            if (HIEU_SETS[filter]) {
                const numbers = HIEU_SETS[filter].split(',').map(num => num.trim());
                setResult(numbers);
                setFilterStatus(prev => ({
                    ...prev,
                    [filter]: true
                }));
                const timeoutId = setTimeout(() => {
                    setFilterStatus(prev => ({
                        ...prev,
                        [filter]: false
                    }));
                }, 2000);
                timeoutRefs.current.push(timeoutId);
            } else {
                // Original API call for other filters
                const response = await axios.post(`${API_URL}/api/dande/dacbiet/quick`, {
                    filter
                });

                if (response.data.success) {
                    setResult(response.data.data.result);
                    setFilterStatus(prev => ({
                        ...prev,
                        [filter]: true
                    }));
                    const timeoutId = setTimeout(() => {
                        setFilterStatus(prev => ({
                            ...prev,
                            [filter]: false
                        }));
                    }, 2000);
                    timeoutRefs.current.push(timeoutId);
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            setModalMessage('Lỗi khi lấy dàn số');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result.length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        const copyText = `${selectedFilter} (${result.length} số)\n${result.join(',')}`;

        navigator.clipboard.writeText(copyText).then(() => {
            setCopyStatus(true);
            const timeoutId = setTimeout(() => setCopyStatus(false), 2000);
            timeoutRefs.current.push(timeoutId);
        }).catch(() => {
            setModalMessage('Lỗi khi copy. Vui lòng thử lại.');
            setShowModal(true);
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <div className={styles.toolContainer}>
            <h2 className={styles.toolTitle}><Layers size={16} style={{ display: 'inline', marginRight: '8px' }} />Lấy Nhanh Dàn Đặc Biệt</h2>

            <div className={styles.filterSections}>
                {/* Đầu */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Đầu</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.dau.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Đuôi */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Đuôi</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.duoi.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tổng */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Tổng</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.tong.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Đầu-Đuôi */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Đầu-Đuôi</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.dauDuoi.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bé/Lớn */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Bé/Lớn</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.beLon.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kép */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Kép</h3>
                    <div className={styles.filterButtons}>
                        {FILTERS.kep.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hiệu số & Con giáp - Separate rows */}
            <div className={styles.hieuSection}>
                <div className={styles.hieuGroup}>
                    <h3 className={styles.hieuGroupTitle}>Hiệu số</h3>
                    <div className={styles.hieuFilterButtons}>
                        {FILTERS.hieu.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Con giáp - Separate row */}
            <div className={styles.hieuSection}>
                <div className={styles.hieuGroup}>
                    <h3 className={styles.hieuGroupTitle}>Con giáp</h3>
                    <div className={styles.hieuFilterButtons}>
                        {FILTERS.conGiap.map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={`${styles.filterButton} ${selectedFilter === filter ? styles.active : ''} ${filterStatus[filter] ? styles.successButton : ''}`}
                                disabled={loading}
                            >
                                {filterStatus[filter] ? <Check size={14} /> : null}
                                <span className={styles.buttonText}>
                                    {filterStatus[filter] ? 'Đã Lấy!' : filter}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results textarea below buttons */}
            <div className={styles.layNhanhResults}>
                <div className={styles.resultsHeader}>
                    <h3 className={styles.resultsTitle}>
                        {loading ? '⏳ Đang xử lý...' : result.length > 0 ? `Kết quả (${result.length} số)` : 'Chọn bộ lọc để xem kết quả'}
                    </h3>
                    {result.length > 0 && (
                        <button
                            onClick={handleCopy}
                            className={`${styles.copyButton} ${copyStatus ? styles.successButton : ''}`}
                        >
                            {copyStatus ? <Check size={14} /> : <Copy size={14} />}
                            <span className={styles.buttonText}>
                                {copyStatus ? 'Đã Copy!' : 'Copy'}
                            </span>
                        </button>
                    )}
                </div>
                <textarea
                    value={result.length > 0 ? result.join(', ') : ''}
                    readOnly
                    placeholder="Kết quả sẽ hiển thị ở đây..."
                    className={styles.layNhanhTextarea}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <p className={styles.modalMessage}>{modalMessage}</p>
                        <button onClick={closeModal} className={styles.modalButton}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

