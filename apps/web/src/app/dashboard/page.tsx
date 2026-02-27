'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { elementenApi } from '@/lib/api';

const ROL_KLEUREN: Record<string, string> = {
  DROMER: 'bg-purple-100 text-purple-800',
  GIDS: 'bg-blue-100 text-blue-800',
  ARCHITECT: 'bg-green-100 text-green-800',
  BOUWER: 'bg-orange-100 text-orange-800',
  VALIDATOR: 'bg-red-100 text-red-800',
  BEHEERDER: 'bg-gray-100 text-gray-800',
};

const TYPE_KLEUREN: Record<string, string> = {
  VISIE: 'bg-purple-100 text-purple-700',
  PRINCIPE: 'bg-indigo-100 text-indigo-700',
  EPIC: 'bg-blue-100 text-blue-700',
  MODULE: 'bg-cyan-100 text-cyan-700',
  FUNCTIONALITEIT: 'bg-teal-100 text-teal-700',
  FUNCTIONEEL_ONTWERP: 'bg-green-100 text-green-700',
  TECHNISCH_ONTWERP: 'bg-lime-100 text-lime-700',
  USER_STORY: 'bg-yellow-100 text-yellow-700',
  API_CONTRACT: 'bg-orange-100 text-orange-700',
  DATAMODEL: 'bg-red-100 text-red-700',
};

const STATUS_KLEUREN: Record<string, string> = {
  CONCEPT: 'bg-gray-100 text-gray-600',
  IN_DISCUSSIE: 'bg-blue-100 text-blue-700',
  TER_VASTSTELLING: 'bg-orange-100 text-orange-700',
  VASTGESTELD: 'bg-green-100 text-green-700',
  IN_UITWERKING: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  GEPUBLICEERD: 'bg-green-100 text-green-700',
  SPECIFICATIE: 'bg-cyan-100 text-cyan-700',
  COMPLIANCE: 'bg-purple-100 text-purple-700',
  VERFIJND: 'bg-teal-100 text-teal-700',
  GEREED: 'bg-green-100 text-green-700',
  GOEDGEKEURD: 'bg-green-100 text-green-700',
};

export default function DashboardPage() {
  const [gebruiker, setGebruiker] = useState<any>(null);
  const [recenteElementen, setRecenteElementen] = useState<any[]>([]);
  const [vastgesteldeElementen, setVastgesteldeElementen] = useState<any[]>([]);
  const [bezig, setBezig] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('carecanvas_user');
    if (userData) {
      try { setGebruiker(JSON.parse(userData)); } catch {}
    }

    Promise.all([
      elementenApi.vindAlle(),
      elementenApi.vindGoedgekeurd(),
    ])
      .then(([alleRes, goedgekeurdRes]) => {
        setRecenteElementen((alleRes.data?.data ?? []).slice(0, 5));
        setVastgesteldeElementen(goedgekeurdRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setBezig(false));
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Goedendag{gebruiker ? `, ${gebruiker.naam}` : ''}
        </h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          {gebruiker?.rollen?.map((rol: string) => (
            <span
              key={rol}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROL_KLEUREN[rol] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {rol}
            </span>
          ))}
        </div>
      </div>

      {/* Snelkoppelingen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <Link
          href="/sparring"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 transition-colors"
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-semibold mb-1">Sparring-Partner</h3>
          <p className="text-blue-200 text-sm">Verdiep uw idee met AI</p>
        </Link>
        <Link
          href="/inzending"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-5 transition-colors"
        >
          <div className="text-2xl mb-2">✏️</div>
          <h3 className="font-semibold mb-1">Inzending</h3>
          <p className="text-purple-200 text-sm">Voeg een nieuw element toe</p>
        </Link>
        <Link
          href="/elementen"
          className="bg-white border border-gray-100 hover:border-blue-200 rounded-xl p-5 transition-colors"
        >
          <div className="text-2xl mb-2">🧩</div>
          <h3 className="font-semibold text-gray-900 mb-1">Elementen</h3>
          <p className="text-gray-500 text-sm">Alle zorginnovatie-elementen</p>
        </Link>
        <Link
          href="/canvas"
          className="bg-white border border-gray-100 hover:border-blue-200 rounded-xl p-5 transition-colors"
        >
          <div className="text-2xl mb-2">🗺️</div>
          <h3 className="font-semibold text-gray-900 mb-1">Systeem Canvas</h3>
          <p className="text-gray-500 text-sm">{vastgesteldeElementen.length} goedgekeurde elementen</p>
        </Link>
      </div>

      {/* Twee kolommen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recente elementen */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recente elementen</h2>
            <Link href="/elementen" className="text-sm text-blue-600 hover:underline">
              Alle elementen →
            </Link>
          </div>

          {bezig ? (
            <div className="text-gray-400 text-sm">Laden...</div>
          ) : recenteElementen.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500 mb-4">Nog geen elementen aangemaakt.</p>
              <Link
                href="/inzending"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Eerste element toevoegen
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recenteElementen.map((el) => (
                <Link
                  key={el.id}
                  href={`/elementen/${el.id}`}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_KLEUREN[el.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {el.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate">{el.titel}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-3 shrink-0 ${STATUS_KLEUREN[el.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {el.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Vastgestelde elementen (Systeem Canvas preview) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Systeem Canvas</h2>
            <Link href="/canvas" className="text-sm text-blue-600 hover:underline">
              Volledig canvas →
            </Link>
          </div>

          {bezig ? (
            <div className="text-gray-400 text-sm">Laden...</div>
          ) : vastgesteldeElementen.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">
                Nog geen vastgestelde elementen. Stel een Visie of Principe vast om het canvas te vullen.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {vastgesteldeElementen.slice(0, 5).map((el) => (
                <Link
                  key={el.id}
                  href={`/elementen/${el.id}`}
                  className={`border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-all ${TYPE_KLEUREN[el.type] ?? 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold opacity-60 mb-0.5">{el.type.replace(/_/g, ' ')}</p>
                    <h3 className="font-medium text-sm truncate">{el.titel}</h3>
                  </div>
                  <span className="text-xs font-medium opacity-70 ml-3 shrink-0">
                    {el.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
              {vastgesteldeElementen.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{vastgesteldeElementen.length - 5} meer op het canvas
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
