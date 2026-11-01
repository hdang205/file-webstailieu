# Tài Liệu Học Tập (File Study Nest)

Nền tảng chia sẻ, tra cứu và tải xuống tài liệu mã nguồn (HTML, CSS, PHP) cho cộng đồng lập trình viên.

## 📌 Tổng quan dự án

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React, next-themes.
- **Backend / Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, RPC Functions).
- **Trạng thái**: Đã được audit toàn diện, tối ưu bundle, vá lỗi bảo mật/RLS, bổ sung dark mode, preview mã nguồn và responsive hoàn chỉnh.

## 🚀 Tính năng chính

1. **Khám phá & Tìm kiếm tài liệu**:
   - Tra cứu nhanh theo từ khóa, lọc theo định dạng (HTML, CSS, PHP).
   - Xem trước mã nguồn trực tiếp trên trình duyệt kèm nút sao chép (copy code).
   - Tải tệp mã nguồn nguyên bản.
   - Thống kê lượt tải an toàn (không bị chặn bởi RLS).

2. **Đóng góp & Tải lên tài liệu**:
   - Tải lên tệp trực tiếp (`.html`, `.css`, `.php`) với chức năng kéo thả (drag-and-drop) tự động nhận diện định dạng và điền nội dung.
   - Quản lý thẻ tag linh hoạt.
   - Kiểm duyệt tài liệu trước khi xuất bản ra cộng đồng.

3. **Phân quyền & Quản trị (Admin Dashboard)**:
   - Bảo vệ route với `ProtectedRoute` (ngăn truy cập trái phép và hạn chế hiện tượng flash layout).
   - Phê duyệt / Từ chối tài liệu tải lên.
   - Xóa tài liệu với hộp thoại xác nhận an toàn (`AlertDialog`).
   - Giám sát danh sách người dùng và thống kê hệ thống theo thời gian thực.

4. **Giao diện & Trải nghiệm (UI/UX)**:
   - Hỗ trợ giao diện Sáng / Tối / Tự động theo hệ thống (`next-themes`).
   - Thiết kế chuẩn Responsive cho mọi kích thước màn hình (Mobile Drawer / Desktop Navigation).
   - Code-splitting phân tách các trang tải theo yêu cầu, giảm dung lượng bundle tải ban đầu.

## ⚙️ Cài đặt và chạy môi trường cục bộ (Local Development)

### Yêu cầu
- Node.js >= 18.0.0
- npm hoặc bun

### Các bước thực hiện

1. **Clone repository và cài đặt dependencies**:
   ```bash
   git clone <REPO_URL>
   cd file-webstailieu
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Sao chép hoặc cấu hình tệp `.env`:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```

3. **Chạy server phát triển**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ khả dụng tại: `http://localhost:8080`

4. **Kiểm tra cú pháp và build production**:
   ```bash
   # Kiểm tra lint
   npm run lint

   # Kiểm tra TypeScript type
   npx tsc --noEmit

   # Build đóng gói sản phẩm
   npm run build
   ```

## 🗄️ Cấu trúc Database & Migration

Hệ thống sử dụng các migration trong thư mục `supabase/migrations/`:
- `20250920065708_931879ff-5376-44de-b802-221fb7539f99.sql`: Schema cơ sở dữ liệu ban đầu (bảng `profiles`, `documents`, enum và triggers).
- `20261101120000_fix_documents_and_downloads.sql`: Bổ sung foreign key ràng buộc giữa `documents` và `profiles`, hàm RPC `increment_document_download` an toàn, và các chỉ mục (indexes) tối ưu truy vấn.

## 🔗 Liên kết Lovable
- **Dự án**: [Lovable Project](https://lovable.dev/projects/8be79bce-a87d-4a43-8220-1975ce8c9b4e)
