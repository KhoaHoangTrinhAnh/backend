# Backend – Content Management System with Role-based Access Control

Đây là project **backend** được xây dựng bằng **NestJS**, cung cấp hệ thống API và real-time server cho nền tảng quản lý và phân phối nội dung.

Hệ thống hỗ trợ **phân quyền người dùng (Role-based Access Control)** với 3 nhóm chính:

- **Admin**: Quản lý tài khoản người dùng (tạo, sửa, xoá) và gán vai trò (admin, editor, client)
- **Editor**: Soạn thảo và chỉnh sửa nội dung (gồm các block: văn bản, hình ảnh, video)
- **Client (người dùng cuối)**: Đăng nhập và xem nội dung theo thời gian thực

---

## ✨ Tính năng chính

- Xác thực người dùng với **JWT + Redis**
- Phân quyền người dùng theo vai trò
- CRUD người dùng và nội dung (text, image, video)
- Upload ảnh/video lên **Azure Blob Storage**
- Realtime cập nhật nội dung cho client qua **WebSocket**

---

## 🛠 Công nghệ sử dụng

- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [JWT Authentication](https://jwt.io/)
- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

> 📌 Chưa tích hợp tài liệu Swagger cho API.

---

## ⚙️ Hướng dẫn cài đặt
```bash
### 1. Clone repository
git clone https://github.com/your-username/your-backend-repo.git
cd your-backend-repo

### 2. Cài đặt dependencies
npm install

### 3. Cấu hình biến môi trường
Tạo file .env trong thư mục gốc, dựa trên mẫu sau:
MONGO_URI=mongodb://localhost:27017/your-db
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection
AZURE_STORAGE_CONTAINER=your-container-name

### 4. Khởi chạy server
npm run start:dev
Server sẽ chạy tại: http://localhost:3000

📌 Thứ tự khởi chạy toàn hệ thống
Để hệ thống hoạt động đúng, cần chạy theo thứ tự sau:
backend (API + WebSocket + xử lý file)
client-frontend (giao diện xem nội dung cho người dùng cuối)
admin-frontend (giao diện quản trị dành cho admin/editor)

📁 Cấu trúc thư mục chính
src/
├── auth/           # Xác thực, phân quyền (JWT, Guard, Strategy, DTO)
│   └── dto/
├── users/          # Quản lý người dùng (CRUD + gán vai trò)
├── contents/       # Quản lý nội dung (text, image, video theo block)
│   ├── dto/
│   └── interfaces/
├── redis/          # Kết nối Redis (lưu phiên JWT)
├── upload/         # Upload file ảnh/video lên Azure Blob Storage
├── types/          # Các kiểu dữ liệu dùng chung
├── common/         # Middleware, decorators, guards, helpers
└── main.ts         # Điểm khởi động ứng dụng NestJS

📬 Liên hệ
Tác giả: Hoàng Trịnh Anh Khoa
📧 Email: khoahoangtrinhanh@gmail.com
🔗 GitHub: https://github.com/KhoaHoangTrinhAnh


