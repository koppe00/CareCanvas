'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/elementen');
  }, [router]);
  return <div className="p-8 text-gray-400 text-sm">Doorsturen naar Elementen...</div>;
}
