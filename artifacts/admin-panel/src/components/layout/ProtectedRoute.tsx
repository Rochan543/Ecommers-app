import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getToken } from '@/lib/api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [_, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLocation('/login');
    } else {
      setIsChecking(false);
    }
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
