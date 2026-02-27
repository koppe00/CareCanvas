'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { libraryApi, elementenApi } from '@/lib/api';

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

const STATUS_LABEL: Record<string, string> = {
  VASTGESTELD: 'Vastgesteld',
  GEPUBLICEERD: 'Gepubliceerd',
  GOEDGEKEURD: 'Goedgekeurd',
  GEREED: 'Gereed',
};

const CATEGORIE_KLEUREN: Record<string, string> = {
  DATAMODEL: 'bg-blue-100 text-blue-700',
  USER_STORY_SET: 'bg-purple-100 text-purple-700',
  UI_PATROON: 'bg-pink-100 text-pink-700',
  API_CONTRACT: 'bg-green-100 text-green-700',
  PROCES_DIAGRAM: 'bg-orange-100 text-orange-700',
  COMPLIANCE_TEMPLATE: 'bg-red-100 text-red-700',
  FHIR_PROFIEL: 'bg-teal-100 text-teal-700',
};

export default function LibraryPage() {
  const router = useRouter();
  const [gepubliceerd, setGepubliceerd] = useState<any[]>([]);
  const [blokjes, setBlokjes] = useState<any[]>([]);
  const [bezig, setBezig] = useState(true);
  const [zoekterm, setZoekterm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const laad = async () => {
    setBezig(true);
    try {
      const [elemRes, libRes] = await Promise.allSettled([
        elementenApi.vindGoedgekeurd(),
        libraryApi.vindAlle({}),
      ]);
      if (elemRes.status === 'fulfilled') setGepubliceerd(elemRes.value.data as any[]);
      if (libRes.status === 'fulfilled') setBlokjes(libRes.value.data.data ?? []);
    } finally {
      setBezig(false);
    }
  };

  useEffect(() => { laad(); }, []);

  const gefilterd = gepubliceerd.filter((el) => {
    const matchZoek = !zoekterm || el.titel.toLowerCase().includes(zoekterm.toLowerCase()) || el.inhoud?.toLowerCase().includes(zoekterm.toLowerCase());
    const matchType = !typeFilter || el.type === typeFilter;
    return matchZoek && matchType;
  });

  const kopieerBlokje = async (id: string) => {
    try {
      await libraryApi.fork(id);
      alert('Blokje gekopieerd! U vindt het in uw elementen.');
    } catch {
      alert('Fout bij kopiëren. Probeer het opnieuw.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bibliotheek</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vastgestelde en gepubliceerde elementen — herbruikbaar als startpunt voor uw zorgproject
        </p>
      </div>

      {/* Zoek + filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          placeholder="Zoek op titel of inhoud..."
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle typen</option>
          {Object.keys(TYPE_KLEUREN).map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {bezig ? (
        <div className="text-gray-400 text-sm">Bibliotheek laden...</div>
      ) : (
        <>
          {/* ── Gepubliceerde elementen ── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Goedgekeurde elementen</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vastgestelde, gepubliceerde en gereedgekeurde elementen uit CareCanvas
                </p>
              </div>
              {gefilterd.length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                  {gefilterd.length} element{gefilterd.length !== 1 ? 'en' : ''}
                </span>
              )}
            </div>

            {gefilterd.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                <p className="text-gray-500 font-medium mb-1">Geen goedgekeurde elementen gevonden</p>
                <p className="text-gray-400 text-sm">
                  Elementen verschijnen hier zodra ze vastgesteld, gepubliceerd of goedgekeurd zijn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gefilterd.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => router.push(`/elementen/${el.id}`)}
                    className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_KLEUREN[el.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {el.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {STATUS_LABEL[el.status] ?? el.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{el.titel}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{el.toelichting || el.inhoud}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Community bouwblokken ── */}
          {blokjes.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Community bouwblokken</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Herbruikbare templates en patronen die door de community gedeeld worden
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blokjes.map((blokje) => (
                  <div key={blokje.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORIE_KLEUREN[blokje.categorie] ?? 'bg-gray-100 text-gray-700'}`}>
                        {blokje.categorie?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">v{blokje.versie}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{blokje.naam}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blokje.beschrijving}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{blokje.gebruiken ?? 0}× gebruikt</span>
                      <button
                        onClick={() => kopieerBlokje(blokje.id)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Kopiëren
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
