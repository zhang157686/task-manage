"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/auth';
import { AccessKeyListItem, AccessKeyStats } from '@/types/auth';

const createKeySchema = z.object({
  name: z.string().min(1, '密钥名称不能为空').max(100, '密钥名称不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  expires_at: z.string().optional(),
});

type CreateKeyFormValues = z.infer<typeof createKeySchema>;

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<AccessKeyListItem[]>([]);
  const [stats, setStats] = useState<AccessKeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const form = useForm<CreateKeyFormValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      name: '',
      description: '',
      expires_at: '',
    },
  });

  const loadData = async () => {
    try {
      const [keysData, statsData] = await Promise.all([
        authService.getAccessKeys(),
        authService.getAccessKeyStats(),
      ]);
      setKeys(keysData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateKey = async (data: CreateKeyFormValues) => {
    setIsCreating(true);
    try {
      const newKey = await authService.createAccessKey({
        name: data.name,
        description: data.description || undefined,
        expires_at: data.expires_at || undefined,
      });
      setNewKeyValue(newKey.key_value);
      toast.success('API密钥创建成功！');
      form.reset();
      await loadData();
    } catch (error: unknown) {
      console.error('Create key error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any)?.response?.data?.detail || '创建API密钥失败';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleKey = async (id: number) => {
    try {
      await authService.toggleAccessKey(id);
      toast.success('密钥状态已更新');
      await loadData();
    } catch (error) {
      console.error('Toggle key error:', error);
      toast.error('更新密钥状态失败');
    }
  };

  const deleteKey = async (id: number) => {
    if (!confirm('确定要删除这个API密钥吗？此操作不可撤销。')) {
      return;
    }

    try {
      await authService.deleteAccessKey(id);
      toast.success('API密钥已删除');
      await loadData();
    } catch (error) {
      console.error('Delete key error:', error);
      toast.error('删除API密钥失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API密钥管理</h2>
        <p className="text-muted-foreground">
          管理您的API密钥，用于访问TaskManage的API服务
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总密钥数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_keys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃密钥</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_keys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已过期</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired_keys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未使用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unused_keys}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>创建新密钥</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建API密钥</DialogTitle>
            <DialogDescription>
              创建一个新的API密钥来访问TaskManage的服务
            </DialogDescription>
          </DialogHeader>
          {newKeyValue ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">密钥创建成功！</h4>
                <p className="text-sm text-green-700 mb-2">
                  请复制并安全保存您的API密钥，它只会显示一次：
                </p>
                <div className="p-2 bg-white border rounded font-mono text-sm break-all">
                  {newKeyValue}
                </div>
              </div>
              <Button
                onClick={() => {
                  setNewKeyValue(null);
                  setCreateDialogOpen(false);
                }}
                className="w-full"
              >
                完成
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateKey)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密钥名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入密钥名称" {...field} disabled={isCreating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述（可选）</FormLabel>
                      <FormControl>
                        <Input placeholder="输入密钥描述" {...field} disabled={isCreating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>过期时间（可选）</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? '创建中...' : '创建密钥'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API密钥列表</CardTitle>
          <CardDescription>
            管理您的API密钥，包括查看、启用/禁用和删除操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无API密钥</p>
              <p className="text-sm text-muted-foreground mt-1">
                点击&ldquo;创建新密钥&rdquo;来创建您的第一个API密钥
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>密钥预览</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后使用</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        {key.description && (
                          <div className="text-sm text-muted-foreground">
                            {key.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{key.key_preview}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.last_used_at
                        ? format(new Date(key.last_used_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })
                        : '从未使用'}
                    </TableCell>
                    <TableCell>
                      {key.expires_at
                        ? format(new Date(key.expires_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })
                        : '永不过期'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleKey(key.id)}
                        >
                          {key.is_active ? '禁用' : '启用'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteKey(key.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}