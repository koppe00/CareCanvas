'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { elementenApi, relatiesApi } from '@/lib/api';
import { AFLEID_NAAR } from '@carecanvas/shared';
import { AfleidPanel } from '@/components/AfleidPanel';

// ── Workflow definities ────────────────────────────────────────────────────────

const WORKFLOW: Record<string, string[]> = {
  VISIE:                ['CONCEPT', 'IN_DISCUSSIE', 'TER_VASTSTELLING', 'VASTGESTELD'],
  PRINCIPE:             ['CONCEPT', 'IN_DISCUSSIE', 'TER_VASTSTELLING', 'VASTGESTELD'],
  EPIC:                 ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GEPUBLICEERD'],
  MODULE:               ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GEPUBLICEERD'],
  FUNCTIONALITEIT:      ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  FUNCTIONEEL_ONTWERP:  ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  TECHNISCH_ONTWERP:    ['CONCEPT', 'SPECIFICATIE', 'COMPLIANCE', 'VERFIJND', 'GEREED'],
  USER_STORY:           ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
  API_CONTRACT:         ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
  DATAMODEL:            ['CONCEPT', 'IN_UITWERKING', 'IN_REVIEW', 'GOEDGEKEURD'],
};

// ── Status karakteristieken ────────────────────────────────────────────────────

type StatusKenmerk = {
  banner: string;
  bannerKleur: string;
  kanBewerken: boolean;
  standaardTab: 'bewerken' | 'discussie' | 'stemmen' | 'koppelen';
  fase: 'concept' | 'samenwerking' | 'review' | 'vaststelling' | 'afgerond';
};

const STATUS_KENMERKEN: Record<string, StatusKenmerk> = {
  CONCEPT: {
    banner: 'Dit element staat in concept. Schrijf en verfijn uw idee — zodra het klaar is, zet het door naar de volgende fase.',
    bannerKleur: 'bg-gray-50 border-gray-200 text-gray-700',
    kanBewerken: true,
    standaardTab: 'bewerken',
    fase: 'concept',
  },
  IN_DISCUSSIE: {
    banner: 'Open voor community-feedback. Bespreek het element, stel vragen en stem mee om het te verbeteren.',
    bannerKleur: 'bg-blue-50 border-blue-200 text-blue-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'samenwerking',
  },
  IN_UITWERKING: {
    banner: 'Dit element wordt uitgewerkt. Voeg details toe en pas de inhoud aan in samenwerking met uw team.',
    bannerKleur: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    kanBewerken: true,
    standaardTab: 'bewerken',
    fase: 'samenwerking',
  },
  SPECIFICATIE: {
    banner: 'Voeg gedetailleerde specificaties toe. Beschrijf de functionele en technische eisen zo volledig mogelijk.',
    bannerKleur: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    kanBewerken: true,
    standaardTab: 'bewerken',
    fase: 'samenwerking',
  },
  COMPLIANCE: {
    banner: 'Compliance-controle. De inhoud is vergrendeld — noteer bevindingen en opmerkingen via de discussie.',
    bannerKleur: 'bg-purple-50 border-purple-200 text-purple-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'review',
  },
  VERFIJND: {
    banner: 'Verfijn het element op basis van ontvangen feedback. Pas aan waar nodig voordat het gereed wordt gemeld.',
    bannerKleur: 'bg-teal-50 border-teal-200 text-teal-800',
    kanBewerken: true,
    standaardTab: 'bewerken',
    fase: 'samenwerking',
  },
  IN_REVIEW: {
    banner: 'Ter review. De inhoud is vergrendeld — reviewers geven feedback via de discussie.',
    bannerKleur: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'review',
  },
  TER_VASTSTELLING: {
    banner: 'Ter vaststelling. Stemgerechtigden kunnen hun stem uitbrengen. Alleen een beheerder kan dit element vaststellen.',
    bannerKleur: 'bg-orange-50 border-orange-200 text-orange-800',
    kanBewerken: false,
    standaardTab: 'stemmen',
    fase: 'vaststelling',
  },
  VASTGESTELD: {
    banner: 'Vastgesteld. Dit element is formeel goedgekeurd en zichtbaar in het Systeem Canvas.',
    bannerKleur: 'bg-green-50 border-green-200 text-green-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'afgerond',
  },
  GEPUBLICEERD: {
    banner: 'Gepubliceerd. Dit element is klaar en beschikbaar in het Systeem Canvas.',
    bannerKleur: 'bg-green-50 border-green-200 text-green-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'afgerond',
  },
  GOEDGEKEURD: {
    banner: 'Goedgekeurd. Dit element is klaar voor gebruik in de implementatie.',
    bannerKleur: 'bg-green-50 border-green-200 text-green-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'afgerond',
  },
  GEREED: {
    banner: 'Gereed. Dit element is volledig uitgewerkt en afgerond.',
    bannerKleur: 'bg-green-50 border-green-200 text-green-800',
    kanBewerken: false,
    standaardTab: 'discussie',
    fase: 'afgerond',
  },
};

// ── Kleur helpers ──────────────────────────────────────────────────────────────

const TYPE_KLEUREN: Record<string, string> = {
  VISIE:               'bg-purple-100 text-purple-700',
  PRINCIPE:            'bg-indigo-100 text-indigo-700',
  EPIC:                'bg-blue-100 text-blue-700',
  MODULE:              'bg-cyan-100 text-cyan-700',
  FUNCTIONALITEIT:     'bg-teal-100 text-teal-700',
  FUNCTIONEEL_ONTWERP: 'bg-green-100 text-green-700',
  TECHNISCH_ONTWERP:   'bg-lime-100 text-lime-700',
  USER_STORY:          'bg-yellow-100 text-yellow-700',
  API_CONTRACT:        'bg-orange-100 text-orange-700',
  DATAMODEL:           'bg-red-100 text-red-700',
};

const STATUS_KLEUREN: Record<string, string> = {
  CONCEPT:          'bg-gray-100 text-gray-600',
  IN_DISCUSSIE:     'bg-blue-100 text-blue-700',
  TER_VASTSTELLING: 'bg-orange-100 text-orange-700',
  VASTGESTELD:      'bg-green-100 text-green-700',
  IN_UITWERKING:    'bg-indigo-100 text-indigo-700',
  IN_REVIEW:        'bg-yellow-100 text-yellow-700',
  GEPUBLICEERD:     'bg-green-100 text-green-700',
  SPECIFICATIE:     'bg-cyan-100 text-cyan-700',
  COMPLIANCE:       'bg-purple-100 text-purple-700',
  VERFIJND:         'bg-teal-100 text-teal-700',
  GEREED:           'bg-green-100 text-green-700',
  GOEDGEKEURD:      'bg-green-100 text-green-700',
};

const STEMMEN_TYPEN = ['VISIE', 'PRINCIPE'];

// ── Component ──────────────────────────────────────────────────────────────────

type TabType = 'bewerken' | 'discussie' | 'stemmen' | 'koppelen';

export default function ElementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [element, setElement]                       = useState<any>(null);
  const [berichten, setBerichten]                   = useState<any[]>([]);
  const [stemmen, setStemmen]                       = useState<any>(null);
  const [signalen, setSignalen]                     = useState<any[]>([]);
  const [bezig, setBezig]                           = useState(true);
  const [actieveTab, setActieveTab]                 = useState<TabType>('discussie');
  const [nieuwBericht, setNieuwBericht]             = useState('');
  const [berichtBezig, setBerichtBezig]             = useState(false);
  const [statusBezig, setStatusBezig]               = useState(false);
  const [mijnStem, setMijnStem]                     = useState('');
  const [stemBezig, setStemBezig]                   = useState(false);
  const [gebruiker, setGebruiker]                   = useState<any>(null);
  const [gekoppeldeElementen, setGekoppeldeElementen] = useState<Record<string, any>>({});

  // Bewerkformulier state
  const [bewerkTitel, setBewerkTitel]               = useState('');
  const [bewerkInhoud, setBewerkInhoud]             = useState('');
  const [bewerkToelichting, setBewerkToelichting]   = useState('');
  const [bewerkBezig, setBewerkBezig]               = useState(false);
  const [bewerkOpgeslagen, setBewerkOpgeslagen]     = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const opgeslagen = localStorage.getItem('carecanvas_user');
      if (opgeslagen) {
        try { setGebruiker(JSON.parse(opgeslagen)); } catch {}
      }
    }
  }, []);

  const laadAlles = async () => {
    setBezig(true);
    try {
      const [elRes, berichtenRes, stemmenRes, signalenRes] = await Promise.all([
        elementenApi.vindOpId(id),
        elementenApi.vindBerichten(id),
        elementenApi.vindStemmen(id),
        elementenApi.vindSignalen(id),
      ]);
      const el = elRes.data;
      setElement(el);
      setBerichten(berichtenRes.data as any[]);
      setStemmen(stemmenRes.data);
      setSignalen(signalenRes.data as any[]);

      // Initialiseer bewerkformulier
      setBewerkTitel(el.titel ?? '');
      setBewerkInhoud(el.inhoud ?? '');
      setBewerkToelichting(el.toelichting ?? '');

      // Stel standaard tab in op basis van status
      const kenmerk = STATUS_KENMERKEN[el.status];
      if (kenmerk) {
        const standaard = kenmerk.standaardTab;
        // Stemmen tab alleen zichtbaar voor VISIE/PRINCIPE
        if (standaard === 'stemmen' && !STEMMEN_TYPEN.includes(el.type)) {
          setActieveTab('discussie');
        } else {
          setActieveTab(standaard);
        }
      }

      // Laad titels van gekoppelde elementen
      const ids: string[] = (el.gekoppeldAan ?? []).filter(Boolean);
      if (ids.length > 0) {
        const resultaten = await Promise.allSettled(ids.map((gid: string) => elementenApi.vindOpId(gid)));
        const titelsMap: Record<string, any> = {};
        resultaten.forEach((r, i) => {
          if (r.status === 'fulfilled') titelsMap[ids[i]] = r.value.data;
        });
        setGekoppeldeElementen(titelsMap);
      }
    } finally {
      setBezig(false);
    }
  };

  useEffect(() => { laadAlles(); }, [id]);

  const isBeheerder  = gebruiker?.rollen?.includes('BEHEERDER') ?? false;
  const isValidator  = gebruiker?.rollen?.includes('VALIDATOR') ?? false;
  const isArchitect  = gebruiker?.rollen?.includes('ARCHITECT') ?? false;
  const isEigenaar   = element ? (element.eigenaarId === gebruiker?.id) : false;
  const isPrivileged = isBeheerder || isValidator || isArchitect || isEigenaar;

  const workflow    = element ? (WORKFLOW[element.type] ?? []) : [];
  const huidigIndex = workflow.indexOf(element?.status);
  const volgendeStatus = huidigIndex >= 0 && huidigIndex < workflow.length - 1 ? workflow[huidigIndex + 1] : null;
  const vorigeStatus   = huidigIndex > 0 ? workflow[huidigIndex - 1] : null;
  const kenmerk        = element ? (STATUS_KENMERKEN[element.status] ?? null) : null;
  const kanBewerken    = kenmerk?.kanBewerken ?? false;

  const kanVolgendeZetten = volgendeStatus && (
    volgendeStatus === 'VASTGESTELD'     ? isBeheerder :
    volgendeStatus === 'TER_VASTSTELLING' ? isPrivileged :
    true
  );

  // ── Acties ──

  const wijzigStatus = async (nieuweStatus: string) => {
    setStatusBezig(true);
    try {
      const res = await elementenApi.wijzigStatus(id, nieuweStatus);
      setElement(res.data);
      const kenmerkNieuw = STATUS_KENMERKEN[res.data.status];
      if (kenmerkNieuw) {
        const standaard = kenmerkNieuw.standaardTab;
        setActieveTab(standaard === 'stemmen' && !STEMMEN_TYPEN.includes(res.data.type) ? 'discussie' : standaard);
      }
      const sigRes = await elementenApi.vindSignalen(id);
      setSignalen(sigRes.data as any[]);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Fout bij statuswijziging');
    } finally {
      setStatusBezig(false);
    }
  };

  const slaBewerkingenOp = async () => {
    if (bewerkBezig) return;
    setBewerkBezig(true);
    setBewerkOpgeslagen(false);
    try {
      const res = await elementenApi.bijwerken(id, {
        titel: bewerkTitel,
        inhoud: bewerkInhoud,
        toelichting: bewerkToelichting || undefined,
      });
      setElement(res.data);
      setBewerkOpgeslagen(true);
      setTimeout(() => setBewerkOpgeslagen(false), 2500);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Fout bij opslaan');
    } finally {
      setBewerkBezig(false);
    }
  };

  const verstuurBericht = async () => {
    if (!nieuwBericht.trim() || berichtBezig) return;
    setBerichtBezig(true);
    try {
      await elementenApi.voegBerichtToe(id, nieuwBericht.trim());
      setNieuwBericht('');
      const res = await elementenApi.vindBerichten(id);
      setBerichten(res.data as any[]);
    } finally {
      setBerichtBezig(false);
    }
  };

  const brengtStemUit = async () => {
    if (!mijnStem || stemBezig) return;
    setStemBezig(true);
    try {
      await elementenApi.brengtStemUit(id, mijnStem);
      setMijnStem('');
      const res = await elementenApi.vindStemmen(id);
      setStemmen(res.data);
    } finally {
      setStemBezig(false);
    }
  };

  const markeerOpgelost = async (signaalId: string) => {
    try {
      await elementenApi.markeerOpgelost(id, signaalId);
      setSignalen((prev) => prev.filter((s) => s.id !== signaalId));
    } catch {
      alert('Fout bij markeren als opgelost');
    }
  };

  // ── Render ──

  if (bezig) return <div className="p-8 text-gray-400">Element laden...</div>;
  if (!element) return <div className="p-8 text-gray-500">Element niet gevonden.</div>;

  const toonStemmenTab = STEMMEN_TYPEN.includes(element.type);
  const isAfgerond = kenmerk?.fase === 'afgerond';

  // Beschikbare tabs
  const tabs: { key: TabType; label: string }[] = [
    ...(kanBewerken ? [{ key: 'bewerken' as TabType, label: 'Bewerken' }] : []),
    { key: 'discussie', label: `Discussie (${berichten.length})` },
    ...(toonStemmenTab ? [{ key: 'stemmen' as TabType, label: `Stemmen ${stemmen ? `(${stemmen.voor}v / ${stemmen.tegen}t)` : ''}` }] : []),
    { key: 'koppelen', label: 'Koppelingen' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Terug knop */}
      <button
        onClick={() => router.push('/elementen')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← Terug naar elementen
      </button>

      {/* Consistentiesignalen */}
      {signalen.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            {signalen.length} open consistentiesignaal{signalen.length !== 1 ? 'en' : ''}
          </p>
          <div className="space-y-2">
            {signalen.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3">
                <p className="text-sm text-orange-700">{s.boodschap}</p>
                <button
                  onClick={() => markeerOpgelost(s.id)}
                  className="text-xs text-orange-600 hover:text-orange-800 whitespace-nowrap font-medium"
                >
                  Opgelost
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status-fase banner */}
      {kenmerk && (
        <div className={`border rounded-xl px-5 py-3 mb-5 flex items-start gap-3 ${kenmerk.bannerKleur}`}>
          <span className="text-lg mt-0.5">
            {kenmerk.fase === 'concept'       && '✏️'}
            {kenmerk.fase === 'samenwerking'  && '🤝'}
            {kenmerk.fase === 'review'        && '🔍'}
            {kenmerk.fase === 'vaststelling'  && '🗳️'}
            {kenmerk.fase === 'afgerond'      && '✅'}
          </span>
          <p className="text-sm">{kenmerk.banner}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_KLEUREN[element.type] ?? 'bg-gray-100 text-gray-700'}`}>
            {element.type.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_KLEUREN[element.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {element.status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-400 ml-auto">v{element.versie}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{element.titel}</h1>
        {element.toelichting && (
          <p className="text-sm text-gray-500 mb-4">{element.toelichting}</p>
        )}
        {!kanBewerken && (
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t border-gray-50 pt-4">
            {element.inhoud}
          </div>
        )}
        {isAfgerond && (
          <p className="text-xs text-gray-400 mt-3 italic">
            Dit element is afgerond en kan niet meer worden bewerkt.
          </p>
        )}
      </div>

      {/* Workflow voortgang */}
      {workflow.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflow</p>
          <div className="flex items-center gap-0">
            {workflow.map((stap, i) => {
              const isHuidig  = stap === element.status;
              const isGeweest = i < huidigIndex;
              return (
                <div key={stap} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isHuidig  ? 'bg-blue-600 text-white' :
                      isGeweest ? 'bg-green-500 text-white' :
                                  'bg-gray-200 text-gray-400'
                    }`}>
                      {isGeweest ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs text-center leading-tight ${isHuidig ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                      {stap.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {i < workflow.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${isGeweest ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Workflow actieknoppen */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
            {vorigeStatus && !isAfgerond && (
              <button
                onClick={() => wijzigStatus(vorigeStatus)}
                disabled={statusBezig}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 px-4 py-2 border border-gray-200 rounded-lg transition-colors"
              >
                ← {vorigeStatus.replace(/_/g, ' ')}
              </button>
            )}
            {kanVolgendeZetten && volgendeStatus && (
              <button
                onClick={() => wijzigStatus(volgendeStatus)}
                disabled={statusBezig}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-lg transition-colors ml-auto"
              >
                {statusBezig ? 'Bezig...' : `Zet naar ${volgendeStatus.replace(/_/g, ' ')} →`}
              </button>
            )}
            {!kanVolgendeZetten && volgendeStatus === 'VASTGESTELD' && (
              <p className="text-xs text-gray-400 ml-auto self-center">
                Alleen een beheerder kan dit element vaststellen
              </p>
            )}
            {!kanVolgendeZetten && volgendeStatus === 'TER_VASTSTELLING' && (
              <p className="text-xs text-gray-400 ml-auto self-center">
                Indiener, architect, validator of beheerder kan ter vaststelling indienen
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabbladen */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActieveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                actieveTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {/* Actieve-fase indicator */}
              {kenmerk?.standaardTab === tab.key && actieveTab !== tab.key && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 align-middle" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* ── Bewerken tab ── */}
          {actieveTab === 'bewerken' && kanBewerken && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Titel</label>
                <input
                  type="text"
                  value={bewerkTitel}
                  onChange={(e) => setBewerkTitel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titel van het element"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Toelichting <span className="font-normal text-gray-400 lowercase">(optioneel, 1 zin)</span></label>
                <input
                  type="text"
                  value={bewerkToelichting}
                  onChange={(e) => setBewerkToelichting(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Korte omschrijving of context"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Inhoud</label>
                <textarea
                  value={bewerkInhoud}
                  onChange={(e) => setBewerkInhoud(e.target.value)}
                  rows={10}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Beschrijf het element uitgebreid..."
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                {bewerkOpgeslagen ? (
                  <span className="text-sm text-green-600 font-medium">✓ Wijzigingen opgeslagen</span>
                ) : (
                  <span className="text-xs text-gray-400">Wijzigingen worden pas opgeslagen als u klikt op 'Opslaan'</span>
                )}
                <button
                  onClick={slaBewerkingenOp}
                  disabled={bewerkBezig || (!bewerkTitel.trim() || !bewerkInhoud.trim())}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  {bewerkBezig ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          )}

          {/* ── Discussie tab ── */}
          {actieveTab === 'discussie' && (
            <div>
              {/* Fase-specifieke hint */}
              {kenmerk?.fase === 'samenwerking' && element.status === 'IN_DISCUSSIE' && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-700">
                  Deel uw mening, stel vragen of geef suggesties ter verbetering van dit element.
                </div>
              )}
              {kenmerk?.fase === 'review' && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-4 text-sm text-yellow-700">
                  Geef uw review-feedback. Noteer onduidelijkheden, inconsistenties of verbeterpunten.
                </div>
              )}
              {kenmerk?.fase === 'vaststelling' && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 text-sm text-orange-700">
                  Discussie ter ondersteuning van de vaststelling. Argumenten vóór of tegen zijn welkom.
                </div>
              )}

              {berichten.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">Nog geen berichten. Start de discussie.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {berichten.map((b) => (
                    <div key={b.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {b.auteurNaam ?? b.rol}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">
                          {b.rol}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(b.aangemaaktOp).toLocaleString('nl-NL')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{b.tekst}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nieuwBericht}
                  onChange={(e) => setNieuwBericht(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verstuurBericht()}
                  placeholder="Schrijf een reactie..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={verstuurBericht}
                  disabled={!nieuwBericht.trim() || berichtBezig}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Plaatsen
                </button>
              </div>
            </div>
          )}

          {/* ── Stemmen tab ── */}
          {actieveTab === 'stemmen' && toonStemmenTab && (
            <div>
              {kenmerk?.fase === 'vaststelling' && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-5 text-sm text-orange-700">
                  Dit element ligt ter vaststelling. Breng uw stem uit — voor, tegen of onthouding.
                </div>
              )}
              {stemmen && (
                <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stemmen.voor}</p>
                    <p className="text-xs text-gray-500">Voor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{stemmen.tegen}</p>
                    <p className="text-xs text-gray-500">Tegen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400">{stemmen.onthouding}</p>
                    <p className="text-xs text-gray-500">Onthouding</p>
                  </div>
                  <div className="text-center ml-auto">
                    <p className="text-2xl font-bold text-gray-700">{stemmen.totaal}</p>
                    <p className="text-xs text-gray-500">Totaal</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <select
                  value={mijnStem}
                  onChange={(e) => setMijnStem(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kies uw stem...</option>
                  <option value="VOOR">Voor</option>
                  <option value="TEGEN">Tegen</option>
                  <option value="ONTHOUDING">Onthouding</option>
                </select>
                <button
                  onClick={brengtStemUit}
                  disabled={!mijnStem || stemBezig}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  {stemBezig ? 'Bezig...' : 'Stem uitbrengen'}
                </button>
              </div>
              {stemmen?.stemmen?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {stemmen.stemmen.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 text-sm">
                      <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        s.waarde === 'VOOR'       ? 'bg-green-100 text-green-700' :
                        s.waarde === 'TEGEN'      ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                      }`}>{s.waarde}</span>
                      <span className="text-gray-400 text-xs">{new Date(s.aangemaaktOp).toLocaleDateString('nl-NL')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Koppelingen tab ── */}
          {actieveTab === 'koppelen' && (
            <div>
              {(!element.gekoppeldAan || element.gekoppeldAan.filter(Boolean).length === 0) ? (
                <p className="text-sm text-gray-400">
                  Dit element is nog niet gekoppeld aan andere elementen.
                </p>
              ) : (
                <div className="space-y-2">
                  {element.gekoppeldAan.filter(Boolean).map((gekoppeldId: string) => {
                    const gekoppeld = gekoppeldeElementen[gekoppeldId];
                    return (
                      <div
                        key={gekoppeldId}
                        onClick={() => router.push(`/elementen/${gekoppeldId}`)}
                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {gekoppeld ? (
                          <>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_KLEUREN[gekoppeld.type] ?? 'bg-gray-100 text-gray-700'}`}>
                              {gekoppeld.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">{gekoppeld.titel}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto shrink-0 ${STATUS_KLEUREN[gekoppeld.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {gekoppeld.status.replace(/_/g, ' ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-blue-600">→ {gekoppeldId}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
