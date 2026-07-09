import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearToken, getToken } from '@/lib/api';
import { useLocation } from 'wouter';
import { LogOut, Trash2, Server, Key, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [_, setLocation] = useLocation();
  const [pingData, setPingData] = useState<{ status: string; time: number } | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  
  const token = getToken();
  let decodedToken = null;
  try {
    if (token) {
      decodedToken = JSON.parse(atob(token.split('.')[1]));
    }
  } catch (e) {
    // Ignore decode error
  }

  const handlePing = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/healthz');
      if (res.ok) {
        setPingData({ status: 'Healthy', time: Date.now() - start });
        toast.success('API is healthy');
      } else {
        setPingData({ status: 'Error', time: Date.now() - start });
        toast.error('API responded with error');
      }
    } catch (e) {
      setPingData({ status: 'Unreachable', time: Date.now() - start });
      toast.error('Failed to reach API');
    } finally {
      setIsPinging(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    toast.info('Logged out successfully');
    setLocation('/login');
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will clear all local storage including your login token.')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground mt-1">Manage admin preferences and check system health.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="size-5 text-primary" />
              General Information
            </CardTitle>
            <CardDescription>Application details and version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Application Name</Label>
                <div className="font-medium">VR Garlands Admin Panel</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Version</Label>
                <div className="font-mono text-sm bg-muted inline-flex px-2 py-1 rounded">v1.0.0-prod</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Environment</Label>
                <div className="font-mono text-sm bg-muted inline-flex px-2 py-1 rounded">Production</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-blue-500" />
              API Health
            </CardTitle>
            <CardDescription>Check connectivity to the backend services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="space-y-1">
                <div className="font-medium">Backend Connectivity</div>
                <div className="text-sm text-muted-foreground">Ping the healthz endpoint</div>
              </div>
              <div className="flex items-center gap-4">
                {pingData && (
                  <div className={`text-sm font-medium ${pingData.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {pingData.status} ({pingData.time}ms)
                  </div>
                )}
                <Button variant="outline" onClick={handlePing} disabled={isPinging}>
                  {isPinging ? 'Pinging...' : 'Ping Server'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5 text-amber-500" />
              Admin Account
            </CardTitle>
            <CardDescription>Current session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">JWT Token (Truncated)</Label>
                <Input value={token ? `${token.substring(0, 20)}...${token.substring(token.length - 20)}` : 'No token found'} readOnly className="font-mono text-xs bg-muted/50" />
              </div>
              
              {decodedToken && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">User ID</Label>
                    <div className="font-mono text-sm">{decodedToken.id || 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Role</Label>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">ADMIN</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Session Expiry</Label>
                    <div className="text-sm">
                      {decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-border/50 mt-4">
              <Button onClick={handleLogout} variant="secondary" className="gap-2">
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 shadow-sm bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-background/50">
              <div className="space-y-1">
                <div className="font-medium text-destructive">Clear Local Data</div>
                <div className="text-sm text-muted-foreground">Wipes all cached data and session tokens from this browser.</div>
              </div>
              <Button variant="destructive" onClick={handleClearData}>
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
