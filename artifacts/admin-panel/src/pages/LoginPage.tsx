import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { setToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flower2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const [token, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Invalid token');

      const user = await res.json();
      
      if (!user.isAdmin) {
        throw new Error('Not an admin account');
      }

      setToken(token);
      toast.success('Welcome back, Admin');
      setLocation('/');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563241527-3004b7be0ffd')] bg-cover bg-center opacity-[0.03] dark:opacity-[0.02]" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-background/95">
        <CardHeader className="space-y-4 pb-8 pt-8">
          <div className="flex justify-center mb-2">
            <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Flower2 className="size-8" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <CardTitle className="text-3xl font-bold tracking-tight">VR Garlands</CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground/80">
              Admin Command Center
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin JWT Token
              </label>
              <textarea
                id="token"
                value={token}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                required
              />
              <p className="text-[13px] text-muted-foreground flex items-start gap-2 mt-2">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-primary" />
                Enter the JWT token from your admin account to access the control panel.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base shadow-md" 
              disabled={isLoading || !token.trim()}
            >
              {isLoading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
