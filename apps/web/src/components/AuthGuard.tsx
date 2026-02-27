'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [gecontroleerd, setGecontroleerd] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('carecanvas_token');
    if (!token) {
      router.replace('/auth/login');
    } else {
      setGecontroleerd(true);
    }
  }, [router]);

  if (!gecontroleerd) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-sm text-gray-400">Laden...</div>
      </div>
    );
  }

  return <>{children}</>;
}
