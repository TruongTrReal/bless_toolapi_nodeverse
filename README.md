# Farm Multi Nodeverse

Tự động hóa quá trình farming trong Nodeverse với nhiều tài khoản và proxy.

## Cài Đặt

1. **Login user (nodeerse)**:
   đăng nhập vào tài khoản `nodeerse`:
   ```bash
   su - nodeerse
   ```

2. **Clone repository**:
   ```bash
   git clone https://github.com/TruongTrReal/bless_toolapi_nodeverse.git
   cd bless_toolapi_nodeverse
   ```

   Nếu đã cài rồi thì chạy lệnh dưới để pull code mới nhất:
   ```bash
   git checkout -- .
   git clean -fd
   git pull
   ```

3. **Cài đặt các phụ thuộc**:
   ```bash
   npm install
   ```

## Kiểm Tra và Cài Đặt Chromium và Chromedriver

4. **Kiểm tra phiên bản Chromium**:
   Kiểm tra nếu Chromium đã được cài đặt:
   ```bash
   chromium-browser --version
   chromedriver --version
   ```
   Nếu chưa có Chromium, cài đặt Chromium:
   ```bash
   sudo apt install chromium-browser
   ```

   Nếu chưa có Chromedriver, cài đặt Chromedriver:
   ```bash
   sudo apt install chromium-chromedriver
   ```

5. **Đảm bảo đường dẫn đúng**:
   Kiểm tra đường dẫn của Chromium và Chromedriver:
   ```bash
   which chromium
   which chromedriver
   ```
   Đảm bảo rằng đường dẫn là `/snap/bin/chromium-browser` và `/usr/bin/chromedriver`.

7. **Thay đổi đường dẫn nếu cần**:
   Nếu đường dẫn khác, mở file `get_token.js` và thay đổi đường dẫn `binaryPath` cho đúng với đường dẫn của bạn:
   ```javascript
   binaryPath: '/usr/bin/chromium-browser', // Thay đổi nếu cần
   ```

## Cấu Hình

8. **Bật API**:
   ```bash
   node app.js
   ```
   thấy API online ở port 3456 là Ok

8. **Vào tool**:
   KHÔNG TẮT TERMINAL ĐANG CHẠY API 3456, bật cái khác và chạy lệnh
   cd vào trong tool:
   ```bash
   cd blesstool
   ```

9. **Cấu hình accounts**:
   Thêm account vào trong file này, NHỚ định dạng email@email.com:password123
   Chỉnh sửa file `accounts.txt`:
   ```bash
   nano accounts.txt
   ```

   Thêm account xong thì chạy luôn
   ```bash
   npm install
   node get_account_data.js
   ```

9. **Cấu hình proxy**:
   Check số lượng account có token:
   ```bash
   nano idnode.txt
   ```
   Đếm số lượng id node, x5 lần là ra số proxy cần lấy để dán vào proxy

   Chỉnh sửa file `proxy.txt`:
   ```bash
   nano proxy.txt
   ```

## Chạy Ứng Dụng

10. **Chạy tool bless**:
   ```bash
   node window.js
   ```

## Lưu Ý

- Đảm bảo **chromedriver** khớp với phiên bản Chromium của bạn.
- Có thể chạy ở **chế độ headless** bằng cách thay đổi tùy chọn trong script.