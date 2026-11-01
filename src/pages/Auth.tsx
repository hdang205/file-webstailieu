import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const locationState = location.state as { from?: { pathname?: string } } | null;
  const from = locationState?.from?.pathname || '/';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const parseErrorMessage = (err: unknown) => {
    const rawMsg = err instanceof Error ? err.message : String(err || '');
    if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('fetch')) {
      return 'Không thể kết nối đến máy chủ Supabase. Dự án Supabase hiện tại có thể đang bị Tạm dừng (Paused) trên Supabase Dashboard hoặc tên miền chưa phân giải (ERR_NAME_NOT_RESOLVED). Vui lòng vào app.supabase.com để Unpause/Restore dự án.';
    }
    return rawMsg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionError(null);
    if (!loginForm.email.trim() || !loginForm.password) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ email và mật khẩu.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(loginForm.email.trim(), loginForm.password);

      if (error) {
        const errorMsg = parseErrorMessage(error);
        if (error.message?.includes('Failed to fetch')) {
          setConnectionError(errorMsg);
        }
        toast({
          title: 'Đăng nhập không thành công',
          description: errorMsg || 'Email hoặc mật khẩu không chính xác.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Đăng nhập thành công',
          description: 'Chào mừng bạn quay trở lại!',
        });
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMsg = parseErrorMessage(err);
      setConnectionError(errorMsg);
      toast({
        title: 'Lỗi kết nối máy chủ',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionError(null);
    
    if (signupForm.fullName.trim().length < 2) {
      toast({
        title: 'Họ tên không hợp lệ',
        description: 'Họ và tên phải có ít nhất 2 ký tự.',
        variant: 'destructive',
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: 'Mật khẩu quá ngắn',
        description: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.',
        variant: 'destructive',
      });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: 'Mật khẩu không khớp',
        description: 'Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        signupForm.email.trim(),
        signupForm.password,
        signupForm.fullName.trim()
      );

      if (error) {
        const errorMsg = parseErrorMessage(error);
        if (error.message?.includes('Failed to fetch')) {
          setConnectionError(errorMsg);
        }
        toast({
          title: 'Đăng ký không thành công',
          description: errorMsg || 'Không thể đăng ký tài khoản với email này.',
          variant: 'destructive',
        });
      } else {
        setSignupSuccess(true);
        toast({
          title: 'Đăng ký thành công!',
          description: 'Tài khoản của bạn đã được khởi tạo thành công.',
        });
      }
    } catch (err) {
      const errorMsg = parseErrorMessage(err);
      setConnectionError(errorMsg);
      toast({
        title: 'Lỗi kết nối máy chủ',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-3">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay về trang chủ
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md border shadow-md">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-1">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Tài liệu học tập</CardTitle>
          <CardDescription>Đăng nhập hoặc đăng ký tài khoản để đóng góp và tải tài liệu</CardDescription>
        </CardHeader>

        <CardContent>
          {connectionError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Máy chủ Supabase không phản hồi</p>
                <p>{connectionError}</p>
              </div>
            </div>
          )}

          {signupSuccess ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-bold">Đăng ký thành công!</h3>
              <p className="text-sm text-muted-foreground">
                Tài khoản của bạn đã sẵn sàng. Hãy chuyển sang tab Đăng nhập để truy cập ngay vào hệ thống.
              </p>
              <Button onClick={() => setSignupSuccess(false)} className="w-full">
                Chuyển đến Đăng nhập
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      autoComplete="username"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullName">Họ và tên</Label>
                    <Input
                      id="signup-fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      autoComplete="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mật khẩu (tối thiểu 6 ký tự)</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="signup-confirmPassword"
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tạo tài khoản mới
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
