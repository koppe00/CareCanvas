import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

export default function ElementenLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </AuthGuard>
  );
}
