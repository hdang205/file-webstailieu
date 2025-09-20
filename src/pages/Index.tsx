import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Search, Code, Users, Shield } from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: 'Tải lên tài liệu',
      description: 'Chia sẻ tài liệu học tập của bạn với cộng đồng',
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: 'Tìm kiếm & Tải xuống',
      description: 'Tìm kiếm và tải xuống tài liệu theo nhu cầu học tập',
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: 'Hỗ trợ đa dạng',
      description: 'Hỗ trợ tài liệu CSS, HTML, PHP và nhiều loại khác',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Cộng đồng học tập',
      description: 'Kết nối với cộng đồng học lập trình',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tài liệu học tập lập trình
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Nền tảng chia sẻ và tải xuống tài liệu học lập trình hướng đối tượng
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/documents">
                    <FileText className="mr-2 h-5 w-5" />
                    Khám phá tài liệu
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Link to="/upload">
                    <Upload className="mr-2 h-5 w-5" />
                    Tải lên tài liệu
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/auth">
                    Bắt đầu ngay
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Link to="/documents">
                    <Search className="mr-2 h-5 w-5" />
                    Xem tài liệu
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
          <p className="text-xl text-muted-foreground">
            Tất cả những gì bạn cần để học lập trình hiệu quả
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">1000+</h3>
              <p className="text-lg text-muted-foreground">Tài liệu chất lượng</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">500+</h3>
              <p className="text-lg text-muted-foreground">Thành viên tích cực</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">10k+</h3>
              <p className="text-lg text-muted-foreground">Lượt tải xuống</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng bắt đầu học tập?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Tham gia cộng đồng ngay hôm nay để truy cập hàng ngàn tài liệu học lập trình
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link to="/auth">
                Đăng ký miễn phí
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
