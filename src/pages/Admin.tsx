import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Users, Check, X, Eye, Trash2, Search, RefreshCw, AlertTriangle } from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  content: string;
  document_type: 'css' | 'html' | 'php';
  status: 'pending' | 'approved' | 'rejected';
  uploader_id: string;
  file_url: string | null;
  tags: string[] | null;
  download_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface ProfileItem {
  id: string;
  user_id: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

const Admin = () => {
  const [pendingDocs, setPendingDocs] = useState<DocumentItem[]>([]);
  const [approvedDocs, setApprovedDocs] = useState<DocumentItem[]>([]);
  const [users, setUsers] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch pending documents
      const { data: pending, error: pendingError } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // 2. Fetch approved documents  
      const { data: approved, error: approvedError } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      // 3. Fetch all profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Build profile mapping
      const allUsers = (usersData as ProfileItem[]) || [];
      const profilesMap = Object.fromEntries(
        allUsers.map(u => [u.user_id, { full_name: u.full_name }])
      );

      const enrich = (docs: Array<Record<string, unknown>> | null): DocumentItem[] =>
        (docs || []).map(d => ({
          ...(d as unknown as DocumentItem),
          profiles: profilesMap[(d.uploader_id as string)] || { full_name: 'Người dùng' }
        }));

      setPendingDocs(enrich(pending));
      setApprovedDocs(enrich(approved));
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu quản trị.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile?.role, fetchData]);

  const handleApprove = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'approved',
          approved_by: user?.id 
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được phê duyệt.',
      });

      fetchData();
    } catch (error) {
      console.error('Error approving document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt tài liệu.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'rejected',
          approved_by: user?.id 
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Đã từ chối',
        description: 'Tài liệu đã được đánh dấu từ chối.',
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối tài liệu.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docToDelete.id);

      if (error) throw error;

      toast({
        title: 'Đã xóa',
        description: `Đã xóa vĩnh viễn tài liệu "${docToDelete.title}".`,
      });

      setDocToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu.',
        variant: 'destructive',
      });
    }
  };

  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingDocs;
    const q = searchQuery.toLowerCase().trim();
    return pendingDocs.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.profiles?.full_name.toLowerCase().includes(q)
    );
  }, [pendingDocs, searchQuery]);

  const filteredApproved = useMemo(() => {
    if (!searchQuery.trim()) return approvedDocs;
    const q = searchQuery.toLowerCase().trim();
    return approvedDocs.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.profiles?.full_name.toLowerCase().includes(q)
    );
  }, [approvedDocs, searchQuery]);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
              <Shield className="h-7 w-7 text-primary" />
              <span>Bảng điều khiển Quản trị</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Kiểm duyệt tài liệu tải lên, giám sát số liệu và quản lý người dùng trong hệ thống.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={loading}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingDocs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Cần xem xét và phê duyệt</p>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedDocs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Đang hiển thị công khai</p>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Tài khoản đã đăng ký</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="pending" className="relative">
              Chờ duyệt
              {pendingDocs.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  {pendingDocs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt ({approvedDocs.length})</TabsTrigger>
            <TabsTrigger value="users">Người dùng ({users.length})</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lọc tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-9"
            />
          </div>
        </div>
        
        {/* Pending Content */}
        <TabsContent value="pending" className="space-y-4">
          {filteredPending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPending.map((doc) => (
                <Card key={doc.id} className="border shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="uppercase font-mono text-xs">
                        {doc.document_type}
                      </Badge>
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40">
                        Chờ duyệt
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {doc.description || 'Không có mô tả.'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Người đăng: <strong>{doc.profiles?.full_name || 'Người dùng'}</strong></span>
                      <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Xem mã nguồn
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(doc.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Duyệt
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(doc.id)}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card/40">
              <Check className="mx-auto h-10 w-10 text-green-500 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Tất cả tài liệu đã được xử lý</h3>
              <p className="text-sm text-muted-foreground">Hiện tại không có tài liệu nào đang chờ phê duyệt.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Approved Content */}
        <TabsContent value="approved" className="space-y-4">
          {filteredApproved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApproved.map((doc) => (
                <Card key={doc.id} className="border shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="uppercase font-mono text-xs">
                        {doc.document_type}
                      </Badge>
                      <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600">
                        Đã duyệt
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {doc.description || 'Không có mô tả.'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Tác giả: <strong>{doc.profiles?.full_name || 'Người dùng'}</strong></span>
                      <span>{doc.download_count || 0} lượt tải</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Xem nội dung
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Xóa tài liệu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card/40">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold mb-1">Chưa có tài liệu nào được duyệt</h3>
              <p className="text-sm text-muted-foreground">Tài liệu sau khi duyệt sẽ xuất hiện tại đây.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Users Content */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <Card key={u.id} className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{u.full_name}</CardTitle>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  <div>ID: <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{u.user_id.slice(0, 16)}...</code></div>
                  <div>Ngày tham gia: {new Date(u.created_at).toLocaleDateString('vi-VN')}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Code Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="uppercase font-mono text-xs">
                {previewDoc?.document_type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Tác giả: {previewDoc?.profiles?.full_name || 'Người dùng'}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold">{previewDoc?.title}</DialogTitle>
            {previewDoc?.description && (
              <DialogDescription>{previewDoc.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-muted/60 dark:bg-muted/30 border rounded-md p-4 text-xs font-mono my-2">
            <pre className="whitespace-pre-wrap break-all">
              <code>{previewDoc?.content}</code>
            </pre>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Đóng
            </Button>
            {previewDoc && previewDoc.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => {
                    handleApprove(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Duyệt ngay
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    handleReject(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Từ chối
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Xác nhận xóa tài liệu</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu <strong>&quot;{docToDelete?.title}&quot;</strong>?
              Hành động này không thể hoàn tác và tài liệu sẽ bị xóa hoàn toàn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
