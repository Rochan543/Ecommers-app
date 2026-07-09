import React, { useState } from 'react';
import { useNotifications, useSendNotification } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const sendMutation = useSendNotification();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [target, setTarget] = useState('all');
  const [userIds, setUserIds] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = { title, body, type };
    if (target === 'specific' && userIds.trim()) {
      payload.userIds = userIds.split(',').map(id => id.trim()).filter(id => id);
      if (payload.userIds.length === 0) {
        toast.error('Please enter valid User IDs');
        return;
      }
    }

    sendMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Notification sent successfully');
        setTitle('');
        setBody('');
        setUserIds('');
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-muted-foreground mt-1">Send alerts and updates directly to user devices.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        
        <Card className="border-border/50 shadow-sm h-fit sticky top-24">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="size-5 text-primary" />
              Compose Message
            </CardTitle>
            <CardDescription>Send a new push notification to users.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSend} className="space-y-5">
              <div className="space-y-2">
                <Label>Notification Title</Label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Flash Sale Alert!" 
                  required 
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Message Body</Label>
                <textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-y"
                  placeholder="e.g. Get 20% off all jasmine garlands today only."
                  required
                  maxLength={150}
                />
                <div className="text-[10px] text-right text-muted-foreground">{body.length}/150</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="general">General</option>
                    <option value="promo">Promotional</option>
                    <option value="order">Order Related</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <select 
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">All Users (Broadcast)</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>
              </div>

              {target === 'specific' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label>User IDs (Comma separated)</Label>
                  <Input 
                    value={userIds} 
                    onChange={e => setUserIds(e.target.value)} 
                    placeholder="user_id_1, user_id_2" 
                    required={target === 'specific'}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base shadow-md mt-4" disabled={sendMutation.isPending || !title || !body}>
                {sendMutation.isPending ? 'Sending Broadcast...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
            <CardDescription>History of sent notifications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-[300px]">Message Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Sent Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : notifications?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p>No notifications sent yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications?.map((notif: any) => (
                    <TableRow key={notif.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="font-semibold text-sm mb-0.5">{notif.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{notif.body}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          {notif.type || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {notif.userId ? (notif.user?.name || 'Specific User') : <span className="font-medium text-primary">All Users</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {notif.isRead ? (
                          <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="size-3" /> Read
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">Delivered</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(notif.createdAt), 'dd MMM, hh:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
