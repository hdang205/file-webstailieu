import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, X, Plus, FileCode, CheckCircle2, Loader2 } from 'lucide-react';

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    document_type: '' as 'css' | 'html' | 'php' | '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let docType: 'css' | 'html' | 'php' | '' = '';
    
    if (ext === 'css') docType = 'css';
    else if (ext === 'html' || ext === 'htm') docType = 'html';
    else if (ext === 'php') docType = 'php';

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setForm(prev => ({
        ...prev,
        title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, ''),
        content: content || '',
        document_type: docType || prev.document_type,
      }));

      toast({
        title: 'Đã nạp tệp thành công',
        description: `Tệp "${file.name}" đã được đưa vào trình soạn thảo.`,
      });
    };

    reader.onerror = () => {
      toast({
        title: 'Lỗi đọc tệp',
        description: 'Không thể đọc nội dung tệp tin đã chọn.',
        variant: 'destructive',
      });
    };

    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để tải lên tài liệu.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.title.trim() || form.title.length < 3) {
      toast({
        title: 'Tiêu đề không hợp lệ',
        description: 'Tiêu đề tài liệu phải có ít nhất 3 ký tự.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.document_type) {
      toast({
        title: 'Chưa chọn định dạng',
        description: 'Vui lòng chọn loại tài liệu (CSS, HTML hoặc PHP).',
        variant: 'destructive',
      });
      return;
    }

    if (!form.content.trim() || form.content.trim().length < 5) {
      toast({
        title: 'Nội dung code quá ngắn',
        description: 'Vui lòng dán hoặc tải lên nội dung mã nguồn hợp lệ.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          content: form.content,
          document_type: form.document_type,
          tags: form.tags,
          uploader_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Tải lên thành công!',
        description: 'Tài liệu của bạn đã được gửi và đang chờ quản trị viên phê duyệt.',
      });

      navigate('/documents');
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu tài liệu. Vui lòng thử lại.';
      toast({
        title: 'Lỗi tải lên',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    if (form.tags.length >= 8) {
      toast({
        title: 'Giới hạn tag',
        description: 'Tối đa 8 thẻ cho mỗi tài liệu.',
        variant: 'destructive',
      });
      return;
    }
    if (trimmed.length > 25) {
      toast({
        title: 'Tag quá dài',
        description: 'Mỗi thẻ không được vượt quá 25 ký tự.',
        variant: 'destructive',
      });
      return;
    }
    if (form.tags.includes(trimmed)) {
      setNewTag('');
      return;
    }

    setForm({ ...form, tags: [...form.tags, trimmed] });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 text-primary mb-1">
            <UploadIcon className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Chia sẻ tài liệu học tập</CardTitle>
          </div>
          <CardDescription>
            Đóng góp mã nguồn HTML, CSS hoặc PHP cho cộng đồng. Tài liệu sẽ được quản trị viên duyệt trước khi hiển thị công khai.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick File Drop Area */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.css,.php,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <FileCode className="h-9 w-9 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Kéo thả tệp mã nguồn vào đây hoặc <span className="text-primary underline">chọn từ thiết bị</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ tệp .html, .css, .php (văn bản mã nguồn UTF-8)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Tiêu đề tài liệu <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Tạo hiệu ứng Flexbox Layout responsive"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Định dạng mã nguồn <span className="text-destructive">*</span></Label>
                <Select
                  value={form.document_type}
                  onValueChange={(value: 'css' | 'html' | 'php') => 
                    setForm({ ...form, document_type: value })
                  }
                >
                  <SelectTrigger id="document_type">
                    <SelectValue placeholder="Chọn định dạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả tóm tắt</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả chức năng, cách sử dụng hoặc điểm đặc biệt của tài liệu..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Nội dung mã nguồn <span className="text-destructive">*</span></Label>
                <span className="text-xs text-muted-foreground">
                  {form.content.length} ký tự
                </span>
              </div>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Dán hoặc gõ mã nguồn của bạn vào đây..."
                rows={12}
                className="font-mono text-xs sm:text-sm leading-relaxed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-input">Từ khóa (Tags)</Label>
              <div className="flex space-x-2">
                <Input
                  id="tag-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Thêm tag (nhấn Enter hoặc dấu +)..."
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline" size="icon" aria-label="Thêm tag">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1 pr-1">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-destructive"
                        aria-label={`Xóa tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi tài liệu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Đăng tải tài liệu
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
