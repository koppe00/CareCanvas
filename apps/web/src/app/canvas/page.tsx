'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { elementenApi, relatiesApi } from '@/lib/api';

// ── Kleur helpers ──────────────────────────────────────────────────────────────

const TYPE_KLEUREN: Record<string, string> = {
  VISIE:               'bg-purple-50 border-purple-200 text-purple-800',
  PRINCIPE:            'bg-indigo-50 border-indigo-200 text-indigo-800',
  EPIC:                'bg-blue-50 border-blue-200 text-blue-800',
  MODULE:              'bg-cyan-50 border-cyan-200 text-cyan-800',
  FUNCTIONALITEIT:     'bg-teal-50 border-teal-200 text-teal-800',
  FUNCTIONEEL_ONTWERP: 'bg-green-50 border-green-200 text-green-800',
  TECHNISCH_ONTWERP:   'bg-lime-50 border-lime-200 text-lime-800',
  USER_STORY:          'bg-yellow-50 border-yellow-200 text-yellow-800',
  API_CONTRACT:        'bg-orange-50 border-orange-200 text-orange-800',
  DATAMODEL:           'bg-red-50 border-red-200 text-red-800',
};

const TYPE_STREEP: Record<string, string> = {
  VISIE:               'border-purple-400',
  PRINCIPE:            'border-indigo-400',
  EPIC:                'border-blue-400',
  MODULE:              'border-cyan-400',
  FUNCTIONALITEIT:     'border-teal-400',
  FUNCTIONEEL_ONTWERP: 'border-green-400',
  TECHNISCH_ONTWERP:   'border-lime-400',
  USER_STORY:          'border-yellow-400',
  API_CONTRACT:        'border-orange-400',
  DATAMODEL:           'border-red-400',
};

const RELATIE_BADGE: Record<string, string> = {
  AFGELEID_VAN: 'bg-green-100 text-green-700',
  IMPLEMENTEERT: 'bg-blue-100 text-blue-700',
  VERWIJST_NAAR: 'bg-gray-100 text-gray-500',
};

const HIEARCHIE_GROEPEN: { label: string; typen: string[]; beschrijving: string }[] = [
  { label: 'Strategisch fundament', typen: ['VISIE', 'PRINCIPE'], beschrijving: 'Vastgestelde visies en principes' },
  { label: 'Productstructuur', typen: ['EPIC', 'MODULE'], beschrijving: 'Gepubliceerde epics en modules' },
  { label: 'Functionaliteiten & Ontwerpen', typen: ['FUNCTIONALITEIT', 'FUNCTIONEEL_ONTWERP', 'TECHNISCH_ONTWERP'], beschrijving: 'Gereed verklaarde functionaliteiten en ontwerpen' },
  { label: 'Implementatiespecificaties', typen: ['USER_STORY', 'API_CONTRACT', 'DATAMODEL'], beschrijving: 'Goedgekeurde specificaties' },
];

// ── Boom-node ──────────────────────────────────────────────────────────────────

function ElementBoomNode({
  element,
  alleElementen,
  alleRelaties,
  level,
  visited,
  router,
}: {
  element: any;
  alleElementen: Map<string, any>;
  alleRelaties: any[];
  level: number;
  visited: Set<string>;
  router: ReturnType<typeof useRouter>;
}) {
  const [ingeklapt, setIngeklapt] = useState(false);

  if (visited.has(element.id)) return null;
  const nieuweVisited = new Set(visited);
  nieuweVisited.add(element.id);

  // Kinderen = relaties waarbij naarElementId === dit element (van = kind)
  const kindRelaties = alleRelaties.filter(
    (r) =>
      r.naarElementId === element.id &&
      (r.relatieType === 'AFGELEID_VAN' || r.relatieType === 'IMPLEMENTEERT'),
  );
  const kinderen = kindRelaties
    .map((r) => ({ relatie: r, element: alleElementen.get(r.vanElementId) }))
    .filter((k) => k.element != null);

  // VERWIJST_NAAR badges
  const verwijzingen = alleRelaties
    .filter((r) => r.vanElementId === element.id && r.relatieType === 'VERWIJST_NAAR')
    .map((r) => alleElementen.get(r.naarElementId))
    .filter(Boolean);

  const heeftKinderen = kinderen.length > 0;

  return (
    <div style={{ paddingLeft: level > 0 ? 24 : 0 }} className={level > 0 ? 'border-l-2 border-gray-200 ml-3' : ''}>
      <div
        className={`flex items-start gap-2 mb-2 group`}
      >
        {/* Inklapknop */}
        <button
          onClick={() => heeftKinderen && setIngeklapt((v) => !v)}
          className={`mt-2 w-4 h-4 flex-shrink-0 rounded text-xs flex items-center justify-center transition-colors ${
            heeftKinderen
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-pointer'
              : 'invisible'
          }`}
        >
          {ingeklapt ? '+' : '−'}
        </button>

        {/* Kaart */}
        <div
          onClick={() => router.push(`/elementen/${element.id}`)}
          className={`flex-1 border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all ${
            TYPE_KLEUREN[element.type] ?? 'bg-gray-50 border-gray-200 text-gray-800'
          } ${level === 0 ? 'border-l-4 ' + (TYPE_STREEP[element.type] ?? 'border-l-gray-400') : ''}`}
        >
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold opacity-60">{element.type.replace(/_/g, ' ')}</span>
              {verwijzingen.length > 0 && verwijzingen.map((v: any) => (
                <span
                  key={v.id}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                  title={`Verwijst naar: ${v.titel}`}
                >
                  → {v.titel.length > 20 ? v.titel.slice(0, 20) + '…' : v.titel}
                </span>
              ))}
            </div>
            <span className="text-xs opacity-40">v{element.versie}</span>
          </div>
          <p className="font-semibold text-sm mt-1 line-clamp-1">{element.titel}</p>
          {level === 0 && (
            <p className="text-xs opacity-60 mt-0.5 line-clamp-1">{element.inhoud}</p>
          )}
          {heeftKinderen && (
            <p className="text-xs opacity-40 mt-1">{kinderen.length} kind{kinderen.length !== 1 ? 'eren' : ''}</p>
          )}
        </div>
      </div>

      {/* Kinderen */}
      {!ingeklapt && kinderen.map(({ relatie, element: kind }) => (
        <div key={relatie.id} className="flex items-start gap-1">
          <span className={`text-xs px-1.5 py-0.5 rounded-full mt-2 ml-6 flex-shrink-0 ${RELATIE_BADGE[relatie.relatieType] ?? ''}`}>
            {relatie.relatieType === 'AFGELEID_VAN' ? 'afgeleid' : 'impl.'}
          </span>
          <div className="flex-1">
            <ElementBoomNode
              element={kind}
              alleElementen={alleElementen}
              alleRelaties={alleRelaties}
              level={level + 1}
              visited={nieuweVisited}
              router={router}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hoofd pagina ───────────────────────────────────────────────────────────────

type WeergaveMode = 'boom' | 'overzicht';

export default function CanvasPage() {
  const router = useRouter();
  const [elementen, setElementen] = useState<any[]>([]);
  const [relaties, setRelaties]   = useState<any[]>([]);
  const [bezig, setBezig]         = useState(true);
  const [modus, setModus]         = useState<WeergaveMode>('boom');

  useEffect(() => {
    const laad = async () => {
      setBezig(true);
      try {
        const [elRes, relRes] = await Promise.all([
          elementenApi.vindGoedgekeurd(),
          relatiesApi.vindAlleRelaties(),
        ]);
        setElementen(elRes.data as any[]);
        setRelaties(relRes.data as any[]);
      } finally {
        setBezig(false);
      }
    };
    laad();
  }, []);

  const alleElementenMap = new Map<string, any>(elementen.map((el) => [el.id, el]));
  const goedgekeurdIds   = new Set(elementen.map((el) => el.id));

  // Root-elementen = elementen die NIET als vanElementId voorkomen in een
  // AFGELEID_VAN / IMPLEMENTEERT relatie waarvan de naarElementId ook goedgekeurd is
  const kindIds = new Set(
    relaties
      .filter(
        (r) =>
          (r.relatieType === 'AFGELEID_VAN' || r.relatieType === 'IMPLEMENTEERT') &&
          goedgekeurdIds.has(r.naarElementId),
      )
      .map((r) => r.vanElementId),
  );

  const rootElementen = elementen.filter((el) => !kindIds.has(el.id));

  // Orphaned = goedgekeurde elementen die geen relaties hebben (geen kind, geen ouder)
  const metRelatieIds = new Set(
    relaties.flatMap((r) => [r.vanElementId, r.naarElementId]).filter((id) => goedgekeurdIds.has(id)),
  );
  const orphaned = elementen.filter((el) => !metRelatieIds.has(el.id));

  const totaal = elementen.length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systeem Canvas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {modus === 'boom'
              ? 'Hiërarchische boomstructuur op basis van afleidingsrelaties'
              : 'Groepoverzicht van alle vastgestelde en goedgekeurde elementen'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totaal > 0 && (
            <span className="text-sm bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full">
              {totaal} element{totaal !== 1 ? 'en' : ''}
            </span>
          )}
          {/* Modus toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setModus('boom')}
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                modus === 'boom' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Boom
            </button>
            <button
              onClick={() => setModus('overzicht')}
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                modus === 'overzicht' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overzicht
            </button>
          </div>
        </div>
      </div>

      {bezig ? (
        <div className="text-gray-400 text-sm">Canvas laden...</div>
      ) : totaal === 0 ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">🏗️</p>
          <p className="text-blue-800 font-semibold text-lg mb-2">Het Systeem Canvas is nog leeg</p>
          <p className="text-blue-600 text-sm mb-6">
            Voeg elementen toe via Inzending en stel ze vast om ze hier te zien verschijnen.
          </p>
          <button
            onClick={() => router.push('/inzending')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Eerste element toevoegen
          </button>
        </div>
      ) : modus === 'overzicht' ? (
        // ── Overzicht (bestaande grid) ──
        <div className="space-y-8">
          {HIEARCHIE_GROEPEN.map((groep) => {
            const groepElementen = elementen.filter((el) => groep.typen.includes(el.type));
            if (groepElementen.length === 0) return null;
            return (
              <div key={groep.label}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{groep.label}</h2>
                  <p className="text-sm text-gray-400">{groep.beschrijving}</p>
                </div>
                {groep.typen.map((type) => {
                  const typeElementen = groepElementen.filter((el) => el.type === type);
                  if (typeElementen.length === 0) return null;
                  return (
                    <div key={type} className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        {type.replace(/_/g, ' ')} ({typeElementen.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {typeElementen.map((el) => (
                          <div
                            key={el.id}
                            onClick={() => router.push(`/elementen/${el.id}`)}
                            className={`border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all ${TYPE_KLEUREN[el.type] ?? 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-bold opacity-70">{el.status.replace(/_/g, ' ')}</span>
                              <span className="text-xs opacity-50">v{el.versie}</span>
                            </div>
                            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{el.titel}</h3>
                            <p className="text-xs opacity-70 line-clamp-2">{el.inhoud}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        // ── Boom-view ──
        <div>
          {rootElementen.length === 0 ? (
            <p className="text-sm text-gray-400">Geen root-elementen gevonden. Zijn er relaties aangemaakt?</p>
          ) : (
            <div className="space-y-4">
              {rootElementen.map((el) => (
                <div key={el.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <ElementBoomNode
                    element={el}
                    alleElementen={alleElementenMap}
                    alleRelaties={relaties}
                    level={0}
                    visited={new Set()}
                    router={router}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Niet-gekoppelde elementen */}
          {orphaned.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Niet gekoppeld ({orphaned.length})
                </p>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphaned.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => router.push(`/elementen/${el.id}`)}
                    className={`border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all opacity-70 hover:opacity-100 ${
                      TYPE_KLEUREN[el.type] ?? 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-xs font-bold opacity-60 block mb-1">{el.type.replace(/_/g, ' ')}</span>
                    <p className="font-semibold text-sm line-clamp-2">{el.titel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
