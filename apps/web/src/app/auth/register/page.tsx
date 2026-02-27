'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

const rollen = [
  { value: 'DROMER', label: 'Dromer', beschrijving: 'Ik heb een idee voor betere zorg' },
  { value: 'GIDS', label: 'Gids', beschrijving: 'Ik ben een (zorg)domeinexpert' },
  { value: 'ARCHITECT', label: 'Architect', beschrijving: 'Ik maak specificaties en ontwerpen' },
  { value: 'BOUWER', label: 'Bouwer', beschrijving: 'Ik ontwikkel software' },
  { value: 'VALIDATOR', label: 'Validator', beschrijving: 'Ik beoordeel vanuit compliance/patiëntperspectief' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    naam: '',
    email: '',
    wachtwoord: '',
    rollen: ['DROMER'],
    organisatie: '',
  });
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);

  const toggleRol = (rol: string) => {
    setForm((prev) => ({
      ...prev,
      rollen: prev.rollen.includes(rol)
        ? prev.rollen.filter((r) => r !== rol)
        : [...prev.rollen, rol],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rollen.length === 0) {
      setFout('Selecteer minimaal één rol.');
      return;
    }
    setBezig(true);
    setFout('');
    try {
      const res = await authApi.register(form);
      localStorage.setItem('carecanvas_token', res.data.accessToken);
      localStorage.setItem('carecanvas_user', JSON.stringify(res.data.gebruiker));
      router.push('/dashboard');
    } catch (err: any) {
      setFout(err.response?.data?.message ?? 'Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Maak een account aan</h1>
          <p className="text-gray-500 mt-2 text-sm">Gratis toegang tot CareCanvas</p>
        </div>

        {fout && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {fout}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input
              type="text"
              value={form.naam}
              onChange={(e) => setForm({ ...form, naam: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jan de Vries"
              required
            />
          </div>
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
              placeholder="Minimaal 8 tekens"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organisatie (optioneel)</label>
            <input
              type="text"
              value={form.organisatie}
              onChange={(e) => setForm({ ...form, organisatie: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amsterdam UMC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Uw rol(len)</label>
            <div className="space-y-2">
              {rollen.map((rol) => (
                <label
                  key={rol.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.rollen.includes(rol.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.rollen.includes(rol.value)}
                    onChange={() => toggleRol(rol.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rol.label}</p>
                    <p className="text-xs text-gray-500">{rol.beschrijving}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={bezig}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {bezig ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Al een account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
