export const htmlEmailToken = () => {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Xác minh tài khoản</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .content h1 {
            color: #333;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #666;
        }
        .verify-button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Xác minh tài khoản của bạn</h2>
        </div>
        <div class="content">
            <h1>Xin chào,</h1>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng nhấn vào nút bên dưới để xác minh địa chỉ email của bạn.</p>
            <a href="{{link_verify}}" class="verify-button">Xác minh email</a>
            <p>Nếu bạn không yêu cầu xác minh này, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
            <p>© 2024 Công ty ABC. Mọi quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>`
}

export const htmlEmailRemind = () => {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temporary Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
            text-align: center;
        }
        .image {
            margin-bottom: 20px;
        }
        .highlight {
            color: #007bff;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="image">
            <img src="https://example.com/your-image-url.png" alt="Security Image" width="100">
        </div>
        <h2>Mật khẩu tạm thời: <a href="" class="highlight">{{usr_name}}</a></h2>
        <p>Đây là mật khẩu mặc định hệ thống sẽ tạo cho bạn, vui lòng lưu ý thay đổi mật khẩu khi đăng nhập vào hệ thống.</p>
        <p class="highlight">Mật khẩu hết hạn trong 2 giờ. Nếu bạn chưa thay đổi tài khoản sẽ bị xóa</p>
    </div>
</body>
</html>
`
}