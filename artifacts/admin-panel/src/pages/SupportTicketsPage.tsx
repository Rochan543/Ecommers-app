import React, { useState } from 'react';
import { useSupportTickets, useUpdateSupportTicket } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LifeBuoy, MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_TABS = [
  { value: 'All', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

export default function SupportTicketsPage() {
  const [statusTab, setStatusTab] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const { data: tickets, isLoading } = useSupportTickets({ status: statusTab === 'All' ? undefined : statusTab });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
        <p className="text-muted-foreground mt-1">Manage and respond to customer inquiries.</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.value}
            variant={statusTab === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusTab(tab.value)}
            className={statusTab === tab.value ? 'shadow-sm bg-primary/90' : 'bg-background'}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Subject & User</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[300px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tickets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LifeBuoy className="h-12 w-12 mb-4 opacity-20" />
                      <p>No support tickets found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets?.map((ticket: any) => (
                  <TableRow key={ticket.id} className={`hover:bg-muted/20 ${ticket.status === 'open' ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                    <TableCell>
                      <div className="font-medium text-base">{ticket.subject}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <User className="size-3" /> {ticket.user?.name || ticket.user?.email || 'Unknown User'}
                        {ticket.reply && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 rounded ml-2"><CheckCircle className="size-3" /> Replied</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={
                          ticket.status === 'open' ? 'border-red-500 text-red-600 bg-red-50' : 
                          ticket.status === 'in_progress' ? 'border-amber-500 text-amber-600 bg-amber-50' : 
                          'border-green-500 text-green-600 bg-green-50'
                        }
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(ticket.createdAt), 'dd MMM, hh:mm a')}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(ticket.updatedAt), 'dd MMM, hh:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(ticket)} className="font-medium bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        {ticket.status === 'closed' ? 'View' : 'Respond'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReplyDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}

function ReplyDialog({ ticket, onClose }: { ticket: any, onClose: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('');
  const updateMutation = useUpdateSupportTicket();

  // Reset state when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setReplyText(ticket.reply || '');
      setStatus(ticket.status);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = () => {
    updateMutation.mutate({ 
      id: ticket.id, 
      data: { reply: replyText, status } 
    }, {
      onSuccess: () => {
        toast.success('Ticket updated successfully');
        onClose();
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            {ticket.subject}
          </DialogTitle>
          <DialogDescription className="mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 font-medium text-foreground"><User className="size-3" /> {ticket.user?.name} ({ticket.user?.email})</span>
            <span className="flex items-center gap-1"><Clock className="size-3" /> {format(new Date(ticket.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
          </DialogDescription>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Customer Message</Label>
            <div className="bg-background border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
              {ticket.message}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex justify-between">
              Your Reply
              {ticket.reply && <span className="text-green-600 normal-case font-normal flex items-center gap-1"><CheckCircle className="size-3" /> Previously sent</span>}
            </Label>
            <textarea 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex min-h-[150px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm resize-y"
              placeholder="Type your response to the customer here..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Ticket Status</Label>
              <p className="text-xs text-muted-foreground">Update the current state of this inquiry.</p>
            </div>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-[180px] rounded-md border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="gap-2 shadow-sm px-6">
            {updateMutation.isPending ? 'Sending...' : <><Send className="size-4" /> Send Reply & Update</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
