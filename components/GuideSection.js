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
                                    <span>Bộ số đặc biệt (100 bộ có sẵn, chọn tối đa 5)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn chạm (tối đa 10 chạm)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn tổng (tối đa 10 tổng)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Thêm số mong muốn (tối đa 40 số)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Loại bỏ số không may (tối đa 5 số)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Loại bỏ kép bằng (00,11,22...99)</span>
                                </div>
                            </div>

                            <div className={styles.usageSteps}>
                                <h4 className={styles.stepsTitle}>🚀 Cách sử dụng:</h4>
                                <div className={styles.helpQuote}>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 1:</strong> Nhập số lượng dàn cần tạo (1-50 dàn)
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 2:</strong> Chọn các bộ số đặc biệt (tối đa 5 bộ) để tăng độ chính xác
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 3:</strong> Chọn chạm (tối đa 10 chạm) để kiểm soát số có chữ số cuối giống nhau
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 4:</strong> Chọn tổng (tối đa 10 tổng) để kiểm soát tổng 2 chữ số
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 5:</strong> Nhập số mong muốn (tối đa 40 số) để ưu tiên
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 6:</strong> Nhập số cần loại bỏ (tối đa 5 số) để tránh số không may
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 7:</strong> Bật "Loại bỏ kép bằng" để loại bỏ 00,11,22...99 (95s→90s)
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 8:</strong> Nhấn "Tạo Dàn" để bắt đầu quá trình tạo
                                    </div>
                                </div>
                            </div>

                            <div className={styles.tips}>
                                <h4 className={styles.tipsTitle}>
                                    <Star size={16} className={styles.tipsIcon} />
                                    💡 Mẹo sử dụng hiệu quả:
                                </h4>
                                <div className={styles.helpQuote}>
                                    <div className={styles.quoteTip}>
                                        ⭐ <strong>Bộ số đặc biệt:</strong> Chọn tối đa 5 bộ để tăng độ chính xác
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🎯 <strong>Chọn chạm:</strong> Kiểm soát số có chữ số cuối giống nhau (VD: 12,22,32...)
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🔢 <strong>Chọn tổng:</strong> Kiểm soát tổng 2 chữ số (VD: 15 có tổng = 1+5=6)
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🚫 <strong>Loại bỏ kép bằng:</strong> Tự động loại bỏ 00,11,22...99 (giảm 95s→90s)
                                    </div>
                                    <div className={styles.quoteTip}>
                                        💾 <strong>Lưu trữ:</strong> Copy và lưu lại các kết quả quan trọng
                                    </div>
                                </div>
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
                                    <span>Lọc từ danh sách số có sẵn (00-99)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn cấp độ lọc (0X-9X) linh hoạt</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Bộ số đặc biệt (chọn tối đa 5 bộ)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn chạm (tối đa 10 chạm)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Chọn tổng (tối đa 10 tổng)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Thêm/loại bỏ số mong muốn</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Loại bỏ kép bằng (00,11,22...99)</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.featureIcon} />
                                    <span>Ưu tiên số lặp lại nhiều lần</span>
                                </div>
                            </div>

                            <div className={styles.usageSteps}>
                                <h4 className={styles.stepsTitle}>🎯 Cách sử dụng:</h4>
                                <div className={styles.helpQuote}>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 1:</strong> Nhập danh sách số cần lọc (00-99) vào ô bên phải
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 2:</strong> Chọn các cấp độ muốn lọc (0X-9X) theo nhu cầu
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 3:</strong> Chọn bộ số đặc biệt (tối đa 5 bộ) để tăng độ chính xác
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 4:</strong> Chọn chạm (tối đa 10 chạm) để kiểm soát chữ số cuối
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 5:</strong> Chọn tổng (tối đa 10 tổng) để kiểm soát tổng 2 chữ số
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 6:</strong> Thiết lập thêm/loại bỏ số mong muốn
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 7:</strong> Bật "Loại bỏ kép bằng" để loại bỏ 00,11,22...99
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 8:</strong> Nhấn "Lọc Dàn" để xử lý và phân tích
                                    </div>
                                    <div className={styles.quoteStep}>
                                        <strong>Bước 9:</strong> Xem kết quả và copy nếu cần thiết
                                    </div>
                                </div>
                            </div>

                            <div className={styles.tips}>
                                <h4 className={styles.tipsTitle}>
                                    <Star size={16} className={styles.tipsIcon} />
                                    💡 Mẹo lọc hiệu quả:
                                </h4>
                                <div className={styles.helpQuote}>
                                    <div className={styles.quoteTip}>
                                        🔄 <strong>Số trùng lặp:</strong> Nhập số nhiều lần để tăng độ ưu tiên
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🎯 <strong>Chọn chạm:</strong> Kiểm soát số có chữ số cuối giống nhau (VD: 12,22,32...)
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🔢 <strong>Chọn tổng:</strong> Kiểm soát tổng 2 chữ số (VD: 15 có tổng = 1+5=6)
                                    </div>
                                    <div className={styles.quoteTip}>
                                        🚫 <strong>Loại bỏ kép bằng:</strong> Tự động loại bỏ 00,11,22...99 để dàn "sạch" hơn
                                    </div>
                                    <div className={styles.quoteTip}>
                                        📊 <strong>Đa cấp độ:</strong> Chọn nhiều cấp độ để so sánh và đánh giá
                                    </div>
                                    <div className={styles.quoteTip}>
                                        📈 <strong>Thống kê thực tế:</strong> Kết hợp với dữ liệu lịch sử để tăng độ chính xác
                                    </div>
                                </div>
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
                            <h4>🎯 Bộ Số Đặc Biệt</h4>
                            <div className={styles.helpQuote}>
                                <div className={styles.quoteFeature}>
                                    <strong>100 bộ số</strong> được phân loại theo quy luật toán học
                                </div>
                                <div className={styles.quoteFeature}>
                                    Chọn tối đa <strong>5 bộ</strong> để tăng độ chính xác
                                </div>
                                <div className={styles.quoteFeature}>
                                    Giúp <strong>kiểm soát kết quả</strong> khi tạo/lọc dàn
                                </div>
                            </div>
                        </div>

                        <div className={styles.specialFeature}>
                            <div className={styles.specialIconWrapper}>
                                <Users size={20} />
                            </div>
                            <h4>🎯 Chọn Chạm & Tổng</h4>
                            <div className={styles.helpQuote}>
                                <div className={styles.quoteFeature}>
                                    <strong>Chạm:</strong> Kiểm soát số có chữ số cuối giống nhau
                                </div>
                                <div className={styles.quoteFeature}>
                                    <strong>Tổng:</strong> Kiểm soát tổng 2 chữ số của số
                                </div>
                                <div className={styles.quoteFeature}>
                                    Chọn tối đa <strong>10 chạm/tổng</strong> mỗi loại
                                </div>
                            </div>
                        </div>

                        <div className={styles.specialFeature}>
                            <div className={styles.specialIconWrapper}>
                                <CheckCircle size={20} />
                            </div>
                            <h4>⚙️ Kiểm Soát Hoàn Toàn</h4>
                            <div className={styles.helpQuote}>
                                <div className={styles.quoteFeature}>
                                    <strong>Thêm số mong muốn</strong> (tối đa 40 số)
                                </div>
                                <div className={styles.quoteFeature}>
                                    <strong>Loại bỏ số không may</strong> (tối đa 5 số)
                                </div>
                                <div className={styles.quoteFeature}>
                                    <strong>Loại bỏ kép bằng</strong> (00,11,22...99)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lưu ý quan trọng */}
                <div className={styles.importantNote}>
                    <div className={styles.noteHeader}>
                        <Info size={20} className={styles.noteIcon} />
                        <h4>⚠️ Lưu Ý Quan Trọng</h4>
                    </div>
                    <div className={styles.noteContent}>
                        <div className={styles.helpQuote}>
                            <div className={styles.quoteWarning}>
                                <strong>🔍 Công cụ hỗ trợ:</strong> Đây là công cụ tham khảo, không đảm bảo 100% chính xác
                            </div>
                            <div className={styles.quoteWarning}>
                                <strong>🎯 Sử dụng có trách nhiệm:</strong> Kết hợp với kinh nghiệm và kiến thức cá nhân
                            </div>
                            <div className={styles.quoteWarning}>
                                <strong>📊 Tham khảo thêm:</strong> Nên kết hợp với các nguồn dữ liệu và phân tích khác
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GuideSection;
