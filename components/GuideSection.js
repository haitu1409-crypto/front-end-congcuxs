import React from 'react';
import { Info, Filter, Zap, Target, Star, CheckCircle, Settings, Users } from 'lucide-react';
import styles from '../styles/GuideSection.module.css';

const GuideSection = () => {
    return (
        <section className={styles.guideSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <Info size={24} className={styles.titleIcon} />
                        Hướng Dẫn Sử Dụng
                    </h2>
                    <p className={styles.subtitle}>
                        Khám phá cách sử dụng hiệu quả các công cụ tạo dàn đề chuyên nghiệp
                    </p>
                </div>

                <div className={styles.guideGrid}>
                    {/* Tạo Dàn Ngẫu Nhiên */}
                    <div className={styles.guideCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Zap size={20} />
                            </div>
                            <h3 className={styles.cardTitle}>Tạo Dàn Ngẫu Nhiên</h3>
                            <span className={styles.badge}>Cơ Bản</span>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.featuresList}>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Tạo dàn 9x-0x với 10 cấp độ rút dần</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Hỗ trợ tối đa 50 dàn cùng lúc</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Bộ số đặc biệt (100 bộ có sẵn)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Thêm/loại bỏ số mong muốn</span>
                                </div>
                            </div>

                            <div className={styles.usageSteps}>
                                <h4 className={styles.stepsTitle}>Cách sử dụng:</h4>
                                <ol className={styles.stepsList}>
                                    <li>Nhập số lượng dàn cần tạo (1-50)</li>
                                    <li>Chọn các bộ số đặc biệt (tối đa 5 bộ)</li>
                                    <li>Nhập số mong muốn (tối đa 40 số)</li>
                                    <li>Nhập số cần loại bỏ (tối đa 5 số)</li>
                                    <li>Nhấn "Tạo Dàn" để bắt đầu</li>
                                </ol>
                            </div>

                            <div className={styles.tips}>
                                <h4 className={styles.tipsTitle}>
                                    <Star size={16} className={styles.tipsIcon} />
                                    Mẹo sử dụng:
                                </h4>
                                <ul className={styles.tipsList}>
                                    <li>Sử dụng bộ số đặc biệt để tăng độ chính xác</li>
                                    <li>Loại bỏ các số không may mắn</li>
                                    <li>Kết hợp nhiều dàn để đa dạng hóa</li>
                                    <li>Copy và lưu lại kết quả quan trọng</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Lọc Dàn Số */}
                    <div className={styles.guideCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Filter size={20} />
                            </div>
                            <h3 className={styles.cardTitle}>Lọc Dàn Số</h3>
                            <span className={styles.badge}>Nâng Cao</span>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.featuresList}>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Lọc từ danh sách số có sẵn</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Phân tích tần suất xuất hiện</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Ưu tiên số lặp lại nhiều lần</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn cấp độ lọc linh hoạt</span>
                                </div>
                            </div>

                            <div className={styles.usageSteps}>
                                <h4 className={styles.stepsTitle}>Cách sử dụng:</h4>
                                <ol className={styles.stepsList}>
                                    <li>Nhập danh sách số cần lọc (00-99)</li>
                                    <li>Chọn các cấp độ muốn lọc (0X-9X)</li>
                                    <li>Thiết lập các tùy chọn bổ sung</li>
                                    <li>Nhấn "Lọc Dàn" để xử lý</li>
                                    <li>Xem kết quả và copy nếu cần</li>
                                </ol>
                            </div>

                            <div className={styles.tips}>
                                <h4 className={styles.tipsTitle}>
                                    <Star size={16} className={styles.tipsIcon} />
                                    Mẹo sử dụng:
                                </h4>
                                <ul className={styles.tipsList}>
                                    <li>Nhập số trùng lặp để tăng độ ưu tiên</li>
                                    <li>Sử dụng số mong muốn để kiểm soát kết quả</li>
                                    <li>Chọn nhiều cấp độ để so sánh</li>
                                    <li>Kết hợp với dữ liệu thống kê thực tế</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tính năng đặc biệt */}
                <div className={styles.specialFeatures}>
                    <h3 className={styles.specialTitle}>
                        <Target size={20} className={styles.specialIcon} />
                        Tính Năng Đặc Biệt
                    </h3>

                    <div className={styles.featuresGrid}>
                        <div className={styles.specialFeature}>
                            <div className={styles.specialIconWrapper}>
                                <Settings size={20} />
                            </div>
                            <h4>Bộ Số Đặc Biệt</h4>
                            <p>100 bộ số được phân loại theo quy luật, giúp tăng độ chính xác khi tạo dàn</p>
                        </div>

                        <div className={styles.specialFeature}>
                            <div className={styles.specialIconWrapper}>
                                <Users size={20} />
                            </div>
                            <h4>Phân Tích Thông Minh</h4>
                            <p>Hệ thống phân tích tần suất và ưu tiên số xuất hiện nhiều lần</p>
                        </div>

                        <div className={styles.specialFeature}>
                            <div className={styles.specialIconWrapper}>
                                <CheckCircle size={20} />
                            </div>
                            <h4>Kiểm Soát Hoàn Toàn</h4>
                            <p>Cho phép thêm/bớt số theo ý muốn, tùy chỉnh mọi thông số</p>
                        </div>
                    </div>
                </div>

                {/* Lưu ý quan trọng */}
                <div className={styles.importantNote}>
                    <div className={styles.noteHeader}>
                        <Info size={20} className={styles.noteIcon} />
                        <h4>Lưu Ý Quan Trọng</h4>
                    </div>
                    <div className={styles.noteContent}>
                        <p>
                            Đây là công cụ hỗ trợ tham khảo. Kết quả không đảm bảo 100% chính xác.
                            Hãy sử dụng một cách có trách nhiệm và kết hợp với kinh nghiệm cá nhân.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GuideSection;
