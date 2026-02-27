'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', wachtwoord: '' });
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBezig(true);
    setFout('');
    try {
      const res = await authApi.login(form.email, form.wachtwoord);
      localStorage.setItem('carecanvas_token', res.data.accessToken);
      localStorage.setItem('carecanvas_user', JSON.stringify(res.data.gebruiker));
      router.push('/dashboard');
    } catch {
      setFout('Ongeldige inloggegevens. Controleer uw e-mailadres en wachtwoord.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inloggen bij CareCanvas</h1>
          <p className="text-gray-500 mt-2 text-sm">Van Verbeelding naar Zorgkracht</p>
        </div>

        {fout && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {fout}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jan@ziekenhuis.nl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
            <input
              type="password"
              value={form.wachtwoord}
              onChange={(e) => setForm({ ...form, wachtwoord: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={bezig}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {bezig ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nog geen account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  );
}
