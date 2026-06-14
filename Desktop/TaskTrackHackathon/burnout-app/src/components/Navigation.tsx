'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, History, Building2, Presentation, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Hide nav on login page
  if (pathname === '/login') return null;

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/game', label: 'Village', icon: Building2 },
    { href: '/insights', label: 'AI Insights', icon: Brain },
    { href: '/history', label: 'History', icon: History },
    { href: '/slideshow', label: 'Pitch', icon: Presentation },
  ];

  return (
    <nav className="w-full bg-surface border-b border-gray-800 p-4 z-50">
      <div className="max-w-[1650px] mx-auto flex justify-between items-center px-4">
        <h1 className="text-accent font-bold text-xl hidden md:block">Aegis.</h1>
        <div className="flex w-full md:w-auto justify-between md:gap-8 items-center">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link 
                key={href} 
                href={href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-colors ${isActive ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
              >
                <Icon size={24} />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </Link>
            );
          })}

          {/* User & Sign Out */}
          {user && (
            <button
              onClick={signOut}
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer ml-2 md:ml-4 md:border-l md:border-gray-800 md:pl-4"
              title={`Signed in as ${user.displayName || user.email}`}
            >
              <LogOut size={20} />
              <span className="text-xs md:text-sm font-medium hidden md:block">
                {user.displayName?.split(' ')[0] || 'Sign Out'}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
