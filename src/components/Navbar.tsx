import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ThemeToggle from '@/components/ThemeToggle';
import { FileText, Upload, Shield, LogOut, User, Menu, Home, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 transition-opacity hover:opacity-90">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Tài liệu học tập</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Button 
              variant={isActive('/') ? 'secondary' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/" className="flex items-center space-x-1.5">
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
            </Button>

            <Button 
              variant={isActive('/documents') ? 'secondary' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/documents" className="flex items-center space-x-1.5">
                <FileText className="h-4 w-4" />
                <span>Tài liệu</span>
              </Link>
            </Button>
            
            {user && (
              <Button 
                variant={isActive('/upload') ? 'secondary' : 'ghost'} 
                size="sm" 
                asChild
              >
                <Link to="/upload" className="flex items-center space-x-1.5">
                  <Upload className="h-4 w-4" />
                  <span>Tải lên</span>
                </Link>
              </Button>
            )}

            {user && profile?.role === 'admin' && (
              <Button 
                variant={isActive('/admin') ? 'secondary' : 'ghost'} 
                size="sm" 
                asChild
              >
                <Link to="/admin" className="flex items-center space-x-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Quản trị</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background hover:ring-2 hover:ring-ring">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Người dùng'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    {profile?.role === 'admin' && (
                      <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold w-fit">
                        Admin
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth" className="flex items-center space-x-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader className="text-left pb-4 border-b border-border">
                  <SheetTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Tài liệu học tập</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col py-4 space-y-2">
                  <Button 
                    variant={isActive('/') ? 'secondary' : 'ghost'} 
                    className="justify-start w-full"
                    onClick={() => setMobileOpen(false)}
                    asChild
                  >
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Trang chủ
                    </Link>
                  </Button>

                  <Button 
                    variant={isActive('/documents') ? 'secondary' : 'ghost'} 
                    className="justify-start w-full"
                    onClick={() => setMobileOpen(false)}
                    asChild
                  >
                    <Link to="/documents">
                      <FileText className="mr-2 h-4 w-4" />
                      Kho tài liệu
                    </Link>
                  </Button>

                  {user && (
                    <Button 
                      variant={isActive('/upload') ? 'secondary' : 'ghost'} 
                      className="justify-start w-full"
                      onClick={() => setMobileOpen(false)}
                      asChild
                    >
                      <Link to="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Tải lên
                      </Link>
                    </Button>
                  )}

                  {user && profile?.role === 'admin' && (
                    <Button 
                      variant={isActive('/admin') ? 'secondary' : 'ghost'} 
                      className="justify-start w-full"
                      onClick={() => setMobileOpen(false)}
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Quản trị hệ thống
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-2">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm overflow-hidden">
                          <span className="font-medium truncate">{profile?.full_name || 'Người dùng'}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => setMobileOpen(false)}
                      asChild
                    >
                      <Link to="/auth">
                        <LogIn className="mr-2 h-4 w-4" />
                        Đăng nhập / Đăng ký
                      </Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
