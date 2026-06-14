'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/login', '/slideshow'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.replace('/login');
    }
  }, [user, loading, isPublicPage, router]);

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060606]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-gray-600 text-xs font-mono">LOADING AEGIS...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on public page, render nothing while redirecting
  if (!user && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}
