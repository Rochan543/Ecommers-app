import React, { useState } from 'react';
import { useUsers, useUpdateUser } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users as UsersIcon, Search, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { data, isLoading } = useUsers({ page, limit: 10, search: debouncedSearch });
  const updateMutation = useUpdateUser();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground mt-1">Manage customers and administrator accounts.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 bg-background" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-center">Joined</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <UsersIcon className="h-12 w-12 mb-4 opacity-20" />
                      <p>No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.users?.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase shrink-0 border border-primary/20">
                          {user.avatar ? <img src={user.avatar} className="h-full w-full rounded-full object-cover" alt="" /> : user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="font-medium">{user.name || 'Anonymous User'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {user.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3" /> {user.email}</div>}
                        {user.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3" /> {user.phone}</div>}
                        {!user.email && !user.phone && <span className="text-muted-foreground italic text-xs">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {user._count?.orders || 0}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="size-3" />
                        {format(new Date(user.createdAt), 'MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.isAdmin ? (
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0 flex inline-flex items-center gap-1">
                          <ShieldCheck className="size-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal text-muted-foreground">Customer</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Change User Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to {user.isAdmin ? 'revoke admin privileges from' : 'grant admin privileges to'} <strong>{user.name}</strong>?
                              {!user.isAdmin && " They will have full access to this dashboard."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => updateMutation.mutate({ id: user.id, isAdmin: !user.isAdmin }, {
                                onSuccess: () => toast.success(`User role updated`),
                                onError: (err: any) => toast.error(err.message)
                              })}
                            >
                              Confirm Change
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {data && data.total > 0 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm bg-muted/10">
            <div className="text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to Math.min(page * 10, data.total) of {data.total} users
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
