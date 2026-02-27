'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/sparring', label: 'Sparring-Partner', icon: '💬' },
  { href: '/inzending', label: 'Inzending', icon: '✏️' },
  { href: '/elementen', label: 'Elementen', icon: '🧩' },
  { href: '/canvas', label: 'Systeem Canvas', icon: '🗺️' },
  { href: '/library', label: 'Bibliotheek', icon: '📚' },
  { href: '/community', label: 'Community', icon: '👥' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const uitloggen = () => {
    localStorage.removeItem('carecanvas_token');
    localStorage.removeItem('carecanvas_user');
    router.push('/');
  };

  return (
    <>
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">CareCanvas</h1>
        <p className="text-xs text-gray-400 mt-1">Van Verbeelding naar Zorgkracht</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white',
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={uitloggen}
          className="w-full text-left text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Uitloggen
        </button>
      </div>
    </aside>

    <OnboardingTour />
    </>
  );
}
