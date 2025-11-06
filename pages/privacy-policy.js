import Head from 'next/head';

const PrivacyPolicyPage = () => {
    return (
        <>
            <Head>
                <title>Chính Sách Quyền Riêng Tư | Tạo Dàn Đề Wukong</title>
                <meta
                    name="description"
                    content="Chính sách quyền riêng tư của Tạo Dàn Đề Wukong, mô tả cách chúng tôi thu thập và sử dụng dữ liệu người dùng."
                />
            </Head>
            <main style={{ padding: '40px 16px', maxWidth: '960px', margin: '0 auto', lineHeight: 1.7 }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '24px', fontWeight: 700 }}>
                    Chính Sách Quyền Riêng Tư
                </h1>
                <p>
                    Chính sách này trình bày cách Tạo Dàn Đề Wukong ("chúng tôi") thu thập, sử dụng và bảo vệ dữ liệu cá nhân của người
                    dùng khi truy cập và sử dụng trang web <strong>taodandewukong.pro</strong> và các dịch vụ liên quan.
                </p>

                <h2>1. Thông tin chúng tôi thu thập</h2>
                <ul>
                    <li>Thông tin tài khoản khi bạn đăng nhập, bao gồm tên hiển thị, ảnh đại diện và địa chỉ email.</li>
                    <li>
                        Dữ liệu bạn cung cấp khi sử dụng các công cụ của chúng tôi, ví dụ như nội dung nhập vào khi tạo dàn đề hoặc tham gia
                        trò chuyện.
                    </li>
                </ul>

                <h2>2. Mục đích sử dụng dữ liệu</h2>
                <ul>
                    <li>Cung cấp chức năng đăng nhập và cá nhân hóa trải nghiệm người dùng.</li>
                    <li>Duy trì, cải thiện chất lượng dịch vụ và đảm bảo an toàn hệ thống.</li>
                    <li>Liên hệ với bạn khi cần thiết về các vấn đề hỗ trợ hoặc cập nhật quan trọng.</li>
                </ul>

                <h2>3. Lưu trữ và bảo mật</h2>
                <p>
                    Dữ liệu của bạn được lưu trữ trong cơ sở dữ liệu bảo vệ bằng các biện pháp kỹ thuật hợp lý. Chúng tôi thường xuyên rà soát
                    hệ thống để ngăn chặn truy cập trái phép, tiết lộ hoặc thay đổi trái phép dữ liệu cá nhân.
                </p>

                <h2>4. Chia sẻ dữ liệu</h2>
                <p>
                    Chúng tôi không bán hoặc chia sẻ thông tin cá nhân với bên thứ ba, ngoại trừ khi được yêu cầu bởi pháp luật hoặc khi cần thiết
                    để vận hành các dịch vụ hỗ trợ (ví dụ nhà cung cấp hạ tầng). Trong mọi trường hợp, chúng tôi luôn bảo đảm rằng đối tác tuân thủ
                    các tiêu chuẩn bảo mật tương đương.
                </p>

                <h2>5. Quyền của người dùng</h2>
                <ul>
                    <li>Yêu cầu truy cập, cập nhật hoặc xóa dữ liệu cá nhân của bạn bất kỳ lúc nào.</li>
                    <li>Rút lại sự đồng ý đối với việc xử lý dữ liệu và hủy kết nối với ứng dụng thông qua cài đặt Facebook.</li>
                </ul>
                <p>
                    Vui lòng gửi yêu cầu tới email <a href="mailto:contact@taodandewukong.pro">contact@taodandewukong.pro</a>. Chúng tôi sẽ phản hồi trong vòng 7 ngày làm việc.
                </p>

                <h2>6. Cookies và công nghệ theo dõi</h2>
                <p>
                    Chúng tôi có thể sử dụng cookies và các công nghệ tương tự nhằm cải thiện trải nghiệm và phân tích lưu lượng truy cập. Bạn có thể
                    điều chỉnh trình duyệt để từ chối cookies, tuy nhiên một số tính năng có thể hoạt động không tối ưu.
                </p>

                <h2>7. Thay đổi chính sách</h2>
                <p>
                    Chính sách này có thể được cập nhật định kỳ. Thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang này. Nếu thay đổi đáng kể,
                    chúng tôi sẽ thông báo qua trang chủ hoặc email.
                </p>

                <h2>8. Liên hệ</h2>
                <p>
                    Mọi thắc mắc liên quan đến chính sách quyền riêng tư, vui lòng liên hệ:
                </p>
                <ul>
                    <li>Email: <a href="mailto:contact@taodandewukong.pro">contact@taodandewukong.pro</a></li>
                    <li>Trang web: <a href="https://www.taodandewukong.pro">https://www.taodandewukong.pro</a></li>
                </ul>

                <p style={{ marginTop: '32px', fontStyle: 'italic' }}>
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </main>
        </>
    );
};

export default PrivacyPolicyPage;

