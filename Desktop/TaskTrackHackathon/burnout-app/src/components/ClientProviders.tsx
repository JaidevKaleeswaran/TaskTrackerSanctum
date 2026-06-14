'use client';

import { AuthProvider } from '@/components/AuthProvider';
import AuthGate from '@/components/AuthGate';
import Navigation from '@/components/Navigation';
import GlobalTimer from '@/components/GlobalTimer';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GlobalTimer />
      <Navigation />
      <AuthGate>
        <main className="max-w-[1650px] mx-auto pt-4 pb-24 md:pb-8 px-6 h-full w-full">
          {children}
        </main>
      </AuthGate>
    </AuthProvider>
  );
}
