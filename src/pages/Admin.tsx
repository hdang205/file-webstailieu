import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Users, Check, X, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  document_type: 'css' | 'html' | 'php';
  status: 'pending' | 'approved' | 'rejected';
  uploader_id: string;
  file_url: string;
  tags: string[];
  download_count: number;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

const Admin = () => {
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [approvedDocs, setApprovedDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch pending documents
      const { data: pending, error: pendingError } = await supabase
        .from('documents')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch approved documents  
      const { data: approved, error: approvedError } = await supabase
        .from('documents')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setPendingDocs((pending as unknown as Document[]) || []);
      setApprovedDocs((approved as unknown as Document[]) || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu admin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
        description: 'Đã duyệt tài liệu',
      });

      fetchData();
    } catch (error) {
      console.error('Error approving document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt tài liệu',
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
        title: 'Thành công',
        description: 'Đã từ chối tài liệu',
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối tài liệu',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa tài liệu',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu',
        variant: 'destructive',
      });
    }
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center space-x-2">
          <Shield className="h-8 w-8" />
          <span>Quản trị hệ thống</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDocs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedDocs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Chờ duyệt ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt ({approvedDocs.length})</TabsTrigger>
          <TabsTrigger value="users">Người dùng ({users.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDocs.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {doc.document_type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">Chờ duyệt</Badge>
                  </div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Tác giả: {doc.profiles?.full_name || 'Không xác định'}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedDoc?.title}</DialogTitle>
                            <DialogDescription>{selectedDoc?.description}</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{selectedDoc?.content}</code>
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(doc.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Duyệt
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(doc.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {pendingDocs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có tài liệu chờ duyệt
              </h3>
              <p className="text-gray-500">
                Tất cả tài liệu đã được xử lý.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedDocs.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {doc.document_type.toUpperCase()}
                    </Badge>
                    <Badge variant="default">Đã duyệt</Badge>
                  </div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Tác giả: {doc.profiles?.full_name || 'Không xác định'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lượt tải: {doc.download_count}
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{user.full_name}</CardTitle>
                  <CardDescription>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Người dùng'}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;