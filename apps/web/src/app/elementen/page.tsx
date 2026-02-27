'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { elementenApi } from '@/lib/api';

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

const ALLE_TYPEN = [
  'VISIE', 'PRINCIPE', 'EPIC', 'MODULE', 'FUNCTIONALITEIT',
  'FUNCTIONEEL_ONTWERP', 'TECHNISCH_ONTWERP', 'USER_STORY', 'API_CONTRACT', 'DATAMODEL',
];

const ALLE_STATUSSEN = [
  'CONCEPT', 'IN_DISCUSSIE', 'TER_VASTSTELLING', 'VASTGESTELD',
  'IN_UITWERKING', 'IN_REVIEW', 'GEPUBLICEERD', 'SPECIFICATIE',
  'COMPLIANCE', 'VERFIJND', 'GEREED', 'GOEDGEKEURD',
];

export default function ElementenPage() {
  const router = useRouter();
  const [elementen, setElementen] = useState<any[]>([]);
  const [bezig, setBezig] = useState(true);
  const [zoekterm, setZoekterm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [signaalTellers, setSignaalTellers] = useState<Record<string, number>>({});

  const laadElementen = async () => {
    setBezig(true);
    try {
      const params: any = {};
      if (zoekterm) params.zoekterm = zoekterm;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await elementenApi.vindAlle(params);
      const data = res.data.data ?? [];
      setElementen(data);

      // Laad signalen tellers parallel
      const tellers: Record<string, number> = {};
      await Promise.all(
        data.map(async (el: any) => {
          try {
            const sr = await elementenApi.vindSignalen(el.id);
            tellers[el.id] = (sr.data as any[]).length;
          } catch {
            tellers[el.id] = 0;
          }
        }),
      );
      setSignaalTellers(tellers);
    } finally {
      setBezig(false);
    }
  };

  useEffect(() => {
    laadElementen();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elementen</h1>
          <p className="text-gray-500 text-sm mt-1">
            Alle zorginnovatie-elementen — van Visie tot User Story
          </p>
        </div>
        <button
          onClick={() => router.push('/inzending')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Nieuw element
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && laadElementen()}
          placeholder="Zoek op titel of inhoud..."
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle typen</option>
          {ALLE_TYPEN.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle statussen</option>
          {ALLE_STATUSSEN.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          onClick={laadElementen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Zoeken
        </button>
      </div>

      {bezig ? (
        <div className="text-gray-400 text-sm">Elementen laden...</div>
      ) : elementen.length === 0 ? (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
          <p className="text-blue-800 font-medium mb-2">Nog geen elementen gevonden</p>
          <p className="text-blue-600 text-sm mb-4">
            Begin met het toevoegen van uw eerste zorginnovatie-element.
          </p>
          <button
            onClick={() => router.push('/inzending')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Eerste element toevoegen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elementen.map((el) => (
            <div
              key={el.id}
              onClick={() => router.push(`/elementen/${el.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_KLEUREN[el.type] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {el.type.replace(/_/g, ' ')}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_KLEUREN[el.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {el.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{el.titel}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{el.inhoud}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  v{el.versie} · {new Date(el.aangemaaktOp).toLocaleDateString('nl-NL')}
                </span>
                {(signaalTellers[el.id] ?? 0) > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                    {signaalTellers[el.id]} signaal{signaalTellers[el.id] !== 1 ? 'en' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
