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

3. **Cài đặt các phụ thuộc**:
   ```bash
   npm install
   ```

## Kiểm Tra và Cài Đặt Chromium và Chromedriver

4. **Kiểm tra phiên bản Chromium**:
   Kiểm tra nếu Chromium đã được cài đặt:
   ```bash
   chromium --version
   ```
   Nếu chưa có, cài đặt Chromium:
   ```bash
   sudo apt install chromium-browser
   ```

5. **Kiểm tra và cài đặt Chromedriver**:
   Kiểm tra nếu Chromedriver đã được cài đặt:
   ```bash
   chromedriver --version
   ```
   Nếu chưa có, cài đặt Chromedriver:
   ```bash
   sudo apt install chromium-chromedriver
   ```

6. **Đảm bảo đường dẫn đúng**:
   Kiểm tra đường dẫn của Chromium và Chromedriver:
   ```bash
   which chromium
   which chromedriver
   ```
   Đảm bảo rằng đường dẫn là `/snap/bin/chromium` và `/usr/bin/chromedriver`.

7. **Thay đổi đường dẫn nếu cần**:
   Nếu đường dẫn khác, mở file `node_handler/automation.js` và thay đổi đường dẫn `binaryPath` cho đúng với đường dẫn của bạn:
   ```javascript
   binaryPath: '/usr/bin/chromium', // Thay đổi nếu cần
   ```

## Cấu Hình

8. **Bật API**:
   ```bash
   node app.js
   ```
   thấy API online ở port 3456 là Ok

8. **Vào tool**:
   cd vào trong tool:
   ```bash
   cd blesstool
   ```

9. **Cấu hình accounts và proxy**:
   Chỉnh sửa file `accounts.txt` và `proxy.txt`:
   ```bash
   nano accounts.txt
   ```
   ```bash
   nano proxy.txt
   ```

## Chạy Ứng Dụng

10. **Chạy tool bless**:
   ```bash
   npm install
   node get_account_data.js
   node start.js
   ```

## Lưu Ý

- Đảm bảo **chromedriver** khớp với phiên bản Chromium của bạn.
- Có thể chạy ở **chế độ headless** bằng cách thay đổi tùy chọn trong script.