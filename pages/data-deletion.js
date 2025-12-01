import Head from 'next/head';

const DataDeletionPage = () => {
    return (
        <>
            <Head>
                <title>Hướng Dẫn Xóa Dữ Liệu | Tạo Dàn Đề Wukong</title>
                <meta
                    name="description"
                    content="Hướng dẫn yêu cầu xóa dữ liệu người dùng khỏi hệ thống Tạo Dàn Đề Wukong."
                />
            </Head>
            <main style={{ padding: '40px 16px', maxWidth: '960px', margin: '0 auto', lineHeight: 1.7 }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '24px', fontWeight: 700 }}>
                    Hướng Dẫn Xóa Dữ Liệu Người Dùng
                </h1>
                <p>
                    Nếu bạn muốn yêu cầu xóa dữ liệu cá nhân liên quan đến tài khoản của mình trên Tạo Dàn Đề Wukong, vui lòng thực hiện theo
                    các bước bên dưới. Yêu cầu sẽ được xử lý theo quy trình nội bộ và tuân thủ các chính sách của Meta/Facebook.
                </p>

                <h2>1. Gửi yêu cầu qua email</h2>
                <ol>
                    <li>Soạn email tới địa chỉ <a href="mailto:contact@taodandewukong.pro">contact@taodandewukong.pro</a>.</li>
                    <li>Sử dụng tiêu đề: <strong>Yêu cầu xóa dữ liệu Facebook Login</strong>.</li>
                    <li>
                        Cung cấp các thông tin sau để chúng tôi xác minh:
                        <ul>
                            <li>Họ tên và địa chỉ email dùng để đăng nhập.</li>
                            <li>ID Facebook (nếu biết) hoặc đường dẫn tới trang cá nhân.</li>
                            <li>Nội dung yêu cầu cụ thể (ví dụ: xóa toàn bộ dữ liệu, xóa lịch sử trò chuyện...).</li>
                        </ul>
                    </li>
                </ol>
                <p>Chúng tôi sẽ phản hồi trong vòng 7 ngày làm việc để xác nhận và thông báo tiến độ xử lý.</p>

                <h2>2. Thu hồi quyền truy cập trực tiếp trên Facebook</h2>
                <p>
                    Bạn có thể gỡ quyền ứng dụng thông qua trang cài đặt Facebook tại
                    <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noreferrer"> https://www.facebook.com/settings?tab=applications</a>.
                    Khi ứng dụng bị gỡ, chúng tôi sẽ nhận được thông báo và tiến hành xóa dữ liệu liên quan trong vòng 30 ngày.
                </p>

                <h2>3. Endpoint hỗ trợ kỹ thuật (tùy chọn)</h2>
                <p>
                    Nếu bạn là developer và muốn gửi yêu cầu tự động, chúng tôi cung cấp endpoint REST:
                </p>
                <pre
                    style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        overflowX: 'auto'
                    }}
                >
{`POST https://api.taodandewukong.pro/api/auth/facebook/delete-data
Body: {
  "userId": "<facebook_user_id>",
  "signedRequest": "<signed_request_from_facebook>"
}`}
                </pre>
                <p>
                    Endpoint yêu cầu đối chiếu `signed_request` do Facebook cung cấp để đảm bảo tính xác thực. Nếu bạn cần tích hợp, liên hệ đội
                    ngũ hỗ trợ để được cấp hướng dẫn chi tiết.
                </p>

                <h2>4. Liên hệ hỗ trợ</h2>
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

export default DataDeletionPage;

