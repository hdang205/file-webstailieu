import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, FileText, Code, Eye, Copy, Check, X, RefreshCw } from 'lucide-react';

export interface DocumentItem {
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

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [copied, setCopied] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch approved documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      const rawDocs = docsData || [];

      // 2. Safely resolve profiles for uploaders (bulletproof across all Supabase schemas)
      const uploaderIds = Array.from(new Set(rawDocs.map(d => d.uploader_id).filter(Boolean)));
      let profilesMap: Record<string, { full_name: string }> = {};

      if (uploaderIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', uploaderIds);

          if (profilesData) {
            profilesMap = Object.fromEntries(
              profilesData.map(p => [p.user_id, { full_name: p.full_name }])
            );
          }
        } catch (profileErr) {
          console.warn('Could not fetch profiles metadata:', profileErr);
        }
      }

      const enrichedDocs: DocumentItem[] = rawDocs.map(doc => ({
        ...doc,
        profiles: profilesMap[doc.uploader_id] || { full_name: 'Người dùng' }
      }));

      setDocuments(enrichedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tài liệu. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filtered documents via useMemo for optimal performance
  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        (doc.description && doc.description.toLowerCase().includes(term)) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (selectedType !== 'all') {
      result = result.filter(doc => doc.document_type === selectedType);
    }

    return result;
  }, [documents, searchTerm, selectedType]);

  const handleDownload = async (doc: DocumentItem) => {
    if (!user) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để tải tài liệu.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Safely attempt RPC increment, fallback to direct update
      try {
        const rpcClient = supabase as unknown as {
          rpc: (fn: string, args: { doc_id: string }) => Promise<unknown>;
        };
        await rpcClient.rpc('increment_document_download', { doc_id: doc.id });
      } catch {
        // Fallback if RPC not deployed yet
        await supabase
          .from('documents')
          .update({ download_count: (doc.download_count || 0) + 1 })
          .eq('id', doc.id);
      }

      // Update local state download count immediately for responsiveness
      setDocuments(prev =>
        prev.map(d => (d.id === doc.id ? { ...d, download_count: (d.download_count || 0) + 1 } : d))
      );

      // Trigger text file download
      const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9-]/g, '_')}.${doc.document_type}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);

      toast({
        title: 'Tải xuống thành công',
        description: `Đã tải xuống "${doc.title}".`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải xuống tài liệu.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Đã sao chép mã nguồn',
        description: 'Nội dung đã được lưu vào clipboard của bạn.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép vào clipboard.',
        variant: 'destructive',
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'css':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <Code className="h-3 w-3 mr-1 text-blue-500" />
            CSS
          </Badge>
        );
      case 'html':
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
            <Code className="h-3 w-3 mr-1 text-orange-500" />
            HTML
          </Badge>
        );
      case 'php':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
            <Code className="h-3 w-3 mr-1 text-purple-500" />
            PHP
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            {type.toUpperCase()}
          </Badge>
        );
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Kho tài liệu học tập</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Tìm kiếm và tham khảo các mã nguồn hữu ích được cộng đồng chia sẻ.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDocuments} 
            disabled={loading}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm theo tiêu đề, mô tả hoặc tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Xóa từ khóa"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả định dạng</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Counter summary */}
        {!loading && (
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1">
            <span>Hiển thị {filteredDocuments.length} trên tổng số {documents.length} tài liệu</span>
            {(searchTerm || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="text-primary hover:underline font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-border">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getTypeBadge(doc.document_type)}
                  <span className="text-xs text-muted-foreground font-medium">
                    {doc.download_count || 0} lượt tải
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1 hover:line-clamp-none transition-all">
                  {doc.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {doc.description || 'Không có mô tả chi tiết.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Tác giả: <strong className="font-medium text-foreground">{doc.profiles?.full_name || 'Người dùng'}</strong></span>
                  <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-[11px] px-1.5 py-0 bg-secondary/50">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
                    className="w-full"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Xem trước
                  </Button>
                  <Button 
                    onClick={() => handleDownload(doc)}
                    size="sm"
                    className="w-full"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Tải về
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-card/40">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Không tìm thấy tài liệu phù hợp
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn định dạng tài liệu khác.
          </p>
          {(searchTerm || selectedType !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {previewDoc && getTypeBadge(previewDoc.document_type)}
              <span className="text-xs text-muted-foreground">
                Tác giả: {previewDoc?.profiles?.full_name || 'Người dùng'}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold">{previewDoc?.title}</DialogTitle>
            {previewDoc?.description && (
              <DialogDescription>{previewDoc.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-2 my-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Nội dung mã nguồn:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => previewDoc && handleCopyCode(previewDoc.content)}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Sao chép mã
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-auto bg-muted/60 dark:bg-muted/30 border rounded-md p-4 text-xs font-mono">
              <pre className="whitespace-pre-wrap break-all">
                <code>{previewDoc?.content}</code>
              </pre>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
              Đóng
            </Button>
            {previewDoc && (
              <Button size="sm" onClick={() => handleDownload(previewDoc)}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Tải tệp .{previewDoc.document_type}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
