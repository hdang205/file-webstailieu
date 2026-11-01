import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 text-card-foreground mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Tài liệu học tập</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Nền tảng chia sẻ, tra cứu và tải xuống tài liệu mã nguồn (HTML, CSS, PHP) cho cộng đồng lập trình viên.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Điều hướng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-foreground transition-colors">
                  Kho tài liệu
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-foreground transition-colors">
                  Tải lên tài liệu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Chính sách & An toàn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>Kiểm duyệt trước xuất bản</span>
              </li>
              <li>Mã nguồn cộng đồng đóng góp</li>
              <li>Bảo mật tài khoản với Supabase</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Tài liệu học tập. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            Xây dựng với <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline" /> cho cộng đồng lập trình
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

