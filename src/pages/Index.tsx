import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Search, Code, Users, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documentsCount: 0,
    downloadsCount: 0,
    usersCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, profilesRes] = await Promise.all([
          supabase
            .from('documents')
            .select('download_count', { count: 'exact' })
            .eq('status', 'approved'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true }),
        ]);

        const totalDocs = docsRes.count || 0;
        const totalDownloads = (docsRes.data || []).reduce(
          (acc, cur) => acc + (cur.download_count || 0),
          0
        );
        const totalUsers = profilesRes.count || 0;

        setStats({
          documentsCount: totalDocs,
          downloadsCount: totalDownloads,
          usersCount: totalUsers,
        });
      } catch (e) {
        console.warn('Could not load live stats:', e);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <Upload className="h-7 w-7 text-primary" />,
      title: 'Tải lên & Đóng góp',
      description: 'Chia sẻ nhanh chóng các đoạn mã nguồn và tài liệu học tập có giá trị tới cộng đồng.',
    },
    {
      icon: <Search className="h-7 w-7 text-primary" />,
      title: 'Tra cứu & Tải xuống',
      description: 'Tìm kiếm chính xác theo từ khóa hoặc phân loại định dạng mã nguồn trong vài giây.',
    },
    {
      icon: <Code className="h-7 w-7 text-primary" />,
      title: 'Hỗ trợ đa định dạng',
      description: 'Tối ưu hóa hiển thị và phân loại chuyên biệt cho tệp HTML, CSS và PHP.',
    },
    {
      icon: <Users className="h-7 w-7 text-primary" />,
      title: 'Cộng đồng học lập trình',
      description: 'Môi trường trao đổi học thuật, tham khảo code mẫu chuẩn và kiểm duyệt an toàn.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 border">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Nền tảng chia sẻ tài liệu lập trình trực tuyến
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            Kho tài liệu học tập & mã nguồn mở
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Nơi kết nối và lưu trữ các bài tập mẫu, giao diện và mã nguồn lập trình chất lượng cao dành cho học viên và lập trình viên.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            {user ? (
              <>
                <Button asChild size="lg" className="h-12 px-6 text-base shadow-sm">
                  <Link to="/documents">
                    <FileText className="mr-2 h-5 w-5" />
                    Khám phá kho tài liệu
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <Link to="/upload">
                    <Upload className="mr-2 h-5 w-5" />
                    Đăng tải tài liệu
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="h-12 px-6 text-base shadow-sm">
                  <Link to="/auth">
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
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
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Tính năng nổi bật</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Mọi công cụ cần thiết để học tập, tham khảo và chia sẻ kiến thức lập trình dễ dàng nhất.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/40 py-12">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                {stats.documentsCount > 0 ? stats.documentsCount : '100+'}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Tài liệu đã xuất bản</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                {stats.downloadsCount > 0 ? stats.downloadsCount : '1,000+'}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Lượt tải tài liệu</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                {stats.usersCount > 0 ? stats.usersCount : '500+'}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Thành viên học tập</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="rounded-2xl border bg-card p-8 sm:p-12 shadow-sm space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Sẵn sàng gia nhập cộng đồng học tập?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Tạo tài khoản miễn phí để tải tài liệu không giới hạn và đóng góp kiến thức cho cộng đồng ngay hôm nay.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="h-11 px-8">
                <Link to="/auth">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Đăng ký tài khoản miễn phí
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
