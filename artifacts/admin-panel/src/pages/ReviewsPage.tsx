import React, { useState } from 'react';
import { useReviews, useDeleteReview } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, Trash2, MessageSquareQuote } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useReviews({ page, limit: 10 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Product Reviews</h2>
        <p className="text-muted-foreground mt-1">Monitor and moderate customer feedback.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px]">Product</TableHead>
                <TableHead className="w-[150px]">Customer</TableHead>
                <TableHead className="w-[120px]">Rating</TableHead>
                <TableHead>Review Comment</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.reviews?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquareQuote className="h-12 w-12 mb-4 opacity-20" />
                      <p>No reviews have been submitted yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.reviews?.map((review: any) => (
                  <TableRow key={review.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded border bg-background overflow-hidden shrink-0">
                          {review.product?.image && <img src={review.product.image} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <span className="font-medium text-sm line-clamp-2">{review.product?.name || 'Unknown Product'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium">{review.user?.name || 'Anonymous'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-current' : 'text-muted/50 fill-transparent'}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground italic line-clamp-2 bg-muted/30 p-2 rounded border border-border/30">
                        "{review.comment}"
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(review.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteReviewDialog id={review.id} />
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
              Showing {(page - 1) * 10 + 1} to Math.min(page * 10, data.total) of {data.total} reviews
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

function DeleteReviewDialog({ id }: { id: string }) {
  const mutation = useDeleteReview();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this review? This action cannot be undone and will affect the product's overall rating.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Review deleted'),
              onError: (err: any) => toast.error(err.message)
            })}
          >
            Delete Review
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
