'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { aiApi, elementenApi, relatiesApi } from '@/lib/api';
import { AFLEID_NAAR, ELEMENT_TYPE_LABEL, RelatieType } from '@carecanvas/shared';

interface Props {
  bronElement: any;
  onSluit: () => void;
  onVoltooid: () => void;
}

const RELATIE_KLEUR: Record<string, string> = {
  [RelatieType.AFGELEID_VAN]: 'bg-green-100 text-green-700',
  [RelatieType.IMPLEMENTEERT]: 'bg-blue-100 text-blue-700',
  [RelatieType.VERWIJST_NAAR]: 'bg-gray-100 text-gray-600',
};

const RELATIE_LABEL: Record<string, string> = {
  [RelatieType.AFGELEID_VAN]: 'afgeleid van',
  [RelatieType.IMPLEMENTEERT]: 'implementeert',
  [RelatieType.VERWIJST_NAAR]: 'verwijst naar',
};

const SCORE_KLEUR = (score: number) =>
  score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500';

interface Draft {
  titel: string;
  inhoud: string;
  toelichting: string;
  opgeslagen?: boolean;
}

interface Kandidaat {
  elementId: string;
  score: number;
  reden: string;
  gekoppeld?: boolean;
  titel?: string;
}

interface Bericht {
  rol: 'gebruiker' | 'ai';
  inhoud: string;
}

export function AfleidPanel({ bronElement, onSluit, onVoltooid }: Props) {
  const router = useRouter();
  const mogelikeDoeltypen = (AFLEID_NAAR as any)[bronElement.type] ?? [];

  const [tab, setTab] = useState<'oneshot' | 'sparring'>('oneshot');
  const [doelType, setDoelType] = useState<string>(mogelikeDoeltypen[0]?.type ?? '');
  const relatieType = mogelikeDoeltypen.find((d: any) => d.type === doelType)?.relatie ?? RelatieType.AFGELEID_VAN;

  // One-shot state
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [kandidaten, setKandidaten] = useState<Kandidaat[]>([]);
  const [bezig, setBezig] = useState(false);

  // Sparring state
  const [berichten, setBerichten] = useState<Bericht[]>([
    {
      rol: 'ai',
      inhoud: `Ik help u een ${doelType ? ELEMENT_TYPE_LABEL[doelType as keyof typeof ELEMENT_TYPE_LABEL] ?? doelType : 'element'} afleiden van "${bronElement.titel}". Wat wilt u bereiken of specificeren?`,
    },
  ]);
  const [invoer, setInvoer] = useState('');
  const [sparringBezig, setSparringBezig] = useState(false);
  const [sparringKlassificatie, setSparringKlassificatie] = useState<any>(null);
  const [sparringTitel, setSparringTitel] = useState('');
  const [sparringOpslaanBezig, setSparringOpslaanBezig] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [berichten]);

  const genereerSuggesties = async () => {
    if (!doelType) return;
    setBezig(true);
    setDrafts([]);
    setKandidaten([]);
    try {
      const [bestaandeRes, afleiRes] = await Promise.allSettled([
        elementenApi.vindAlle({ type: doelType }),
        aiApi.afleiden({ bronElement, doelType, bestaandeElementen: [] }),
      ]);

      let bestaande: any[] = [];
      if (bestaandeRes.status === 'fulfilled') {
        bestaande = bestaandeRes.value.data.data ?? [];
      }

      // Nu met bestaande elementen opnieuw aanroepen voor kandidaatscoring
      const afleidRes = await aiApi.afleiden({ bronElement, doelType, bestaandeElementen: bestaande });
      const resultaat = afleidRes.data as any;

      setDrafts((resultaat.drafts ?? []).map((d: any) => ({ ...d })));

      const kandidatenMet = (resultaat.kandidaten ?? []).map((k: any) => ({
        ...k,
        titel: bestaande.find((e: any) => e.id === k.elementId)?.titel ?? k.elementId,
      }));
      setKandidaten(kandidatenMet);
    } catch {
      setDrafts([{ titel: 'Fout bij genereren', inhoud: 'Probeer het opnieuw.', toelichting: '' }]);
    } finally {
      setBezig(false);
    }
  };

  const slaaDraftOp = async (index: number, draft: Draft) => {
    try {
      const res = await elementenApi.maak({
        titel: draft.titel,
        type: doelType,
        inhoud: draft.inhoud,
        toelichting: draft.toelichting || undefined,
      });
      const nieuweId = res.data.id;
      await relatiesApi.maakRelatie(nieuweId, {
        naarElementId: bronElement.id,
        relatieType,
      });
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, opgeslagen: true } : d)));
      onVoltooid();
    } catch {
      alert('Fout bij opslaan. Probeer het opnieuw.');
    }
  };

  const koppelKandidaat = async (kandidaat: Kandidaat) => {
    try {
      await relatiesApi.maakRelatie(kandidaat.elementId, {
        naarElementId: bronElement.id,
        relatieType,
      });
      setKandidaten((prev) =>
        prev.map((k) => (k.elementId === kandidaat.elementId ? { ...k, gekoppeld: true } : k)),
      );
      onVoltooid();
    } catch {
      alert('Fout bij koppelen. Probeer het opnieuw.');
    }
  };

  const verstuurSparring = async () => {
    if (!invoer.trim() || sparringBezig) return;
    const vraag = invoer.trim();
    setInvoer('');
    setBerichten((prev) => [...prev, { rol: 'gebruiker', inhoud: vraag }]);
    setSparringBezig(true);
    setSparringKlassificatie(null);
    try {
      const context = `Bron-element:\nType: ${bronElement.type}\nTitel: ${bronElement.titel}\nInhoud: ${bronElement.inhoud ?? ''}\n\nDoel: afleiden naar ${doelType}`;
      const gesprekGeschiedenis = berichten.map((b) => ({ rol: b.rol === 'gebruiker' ? 'gebruiker' : 'ai', inhoud: b.inhoud }));
      const res = await aiApi.sparring({ nieuweVraag: vraag, gesprekGeschiedenis, projectContext: context });
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: (res.data as any).inhoud }]);
    } catch {
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: 'Er trad een fout op. Probeer het opnieuw.' }]);
    } finally {
      setSparringBezig(false);
    }
  };

  const classificeerSparring = async () => {
    const gesprekTekst = berichten.filter((b) => b.rol === 'gebruiker').map((b) => b.inhoud).join(' ');
    try {
      const res = await aiApi.classificeer(gesprekTekst);
      setSparringKlassificatie({ ...(res.data as any), type: doelType });
      setSparringTitel('');
    } catch {
      alert('Fout bij classificeren.');
    }
  };

  const slaaSparringOp = async () => {
    if (!sparringTitel.trim() || sparringOpslaanBezig) return;
    setSparringOpslaanBezig(true);
    const gesprekTekst = berichten.map((b) => `${b.rol === 'gebruiker' ? 'Gebruiker' : 'AI'}: ${b.inhoud}`).join('\n\n');
    try {
      const res = await elementenApi.maak({
        titel: sparringTitel.trim(),
        type: doelType,
        inhoud: gesprekTekst,
        toelichting: sparringKlassificatie?.toelichting,
      });
      await relatiesApi.maakRelatie(res.data.id, {
        naarElementId: bronElement.id,
        relatieType,
      });
      onVoltooid();
      router.push(`/elementen/${res.data.id}`);
    } catch {
      alert('Fout bij opslaan.');
      setSparringOpslaanBezig(false);
    }
  };

  if (mogelikeDoeltypen.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onSluit} />

      {/* Panel */}
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-base font-bold text-gray-900">Afleiden naar →</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
              van: {bronElement.titel}
            </p>
          </div>
          <button onClick={onSluit} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">
            ✕
          </button>
        </div>

        {/* Doeltype picker */}
        <div className="px-6 py-4 border-b border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Doeltype</label>
          <div className="flex flex-wrap gap-2">
            {mogelikeDoeltypen.map((optie: any) => (
              <button
                key={optie.type}
                onClick={() => setDoelType(optie.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  doelType === optie.type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                {ELEMENT_TYPE_LABEL[optie.type as keyof typeof ELEMENT_TYPE_LABEL] ?? optie.type}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    doelType === optie.type ? 'bg-white/20 text-white' : RELATIE_KLEUR[optie.relatie]
                  }`}
                >
                  {RELATIE_LABEL[optie.relatie]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(['oneshot', 'sparring'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'oneshot' ? 'One-shot' : 'Sparring'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── ONE-SHOT TAB ── */}
          {tab === 'oneshot' && (
            <div>
              <button
                onClick={genereerSuggesties}
                disabled={!doelType || bezig}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mb-5"
              >
                {bezig ? 'Genereren...' : 'Genereer suggesties →'}
              </button>

              {drafts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Nieuwe concepten
                  </h3>
                  <div className="space-y-4">
                    {drafts.map((draft, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white">
                        <input
                          type="text"
                          value={draft.titel}
                          onChange={(e) =>
                            setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, titel: e.target.value } : d)))
                          }
                          className="w-full text-sm font-semibold text-gray-900 border-0 border-b border-gray-100 pb-1 mb-2 focus:outline-none focus:border-blue-300"
                        />
                        <textarea
                          value={draft.inhoud}
                          onChange={(e) =>
                            setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, inhoud: e.target.value } : d)))
                          }
                          rows={4}
                          className="w-full text-xs text-gray-700 border-0 resize-none focus:outline-none leading-relaxed"
                        />
                        {draft.opgeslagen ? (
                          <div className="mt-2 text-xs text-green-600 font-semibold">✓ Opgeslagen en gekoppeld</div>
                        ) : (
                          <button
                            onClick={() => slaaDraftOp(i, draft)}
                            disabled={!draft.titel.trim()}
                            className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Maak nieuw element + koppel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {kandidaten.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Bestaande kandidaten
                  </h3>
                  <div className="space-y-3">
                    {kandidaten.map((k) => (
                      <div key={k.elementId} className="border border-gray-100 rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate mr-2">{k.titel ?? k.elementId}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${SCORE_KLEUR(k.score)}`}>
                            {k.score}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{k.reden}</p>
                        {k.gekoppeld ? (
                          <div className="text-xs text-green-600 font-semibold">✓ Gekoppeld</div>
                        ) : (
                          <button
                            onClick={() => koppelKandidaat(k)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Koppel bestaand element
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SPARRING TAB ── */}
          {tab === 'sparring' && (
            <div>
              <div
                ref={chatRef}
                className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-64 overflow-y-auto mb-3 space-y-2"
              >
                {berichten.map((b, i) => (
                  <div key={i} className={`flex ${b.rol === 'gebruiker' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                        b.rol === 'gebruiker'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                      }`}
                    >
                      {b.inhoud}
                    </div>
                  </div>
                ))}
                {sparringBezig && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
                      Denkt na...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={invoer}
                  onChange={(e) => setInvoer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && verstuurSparring()}
                  placeholder="Typ uw bericht..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={verstuurSparring}
                  disabled={!invoer.trim() || sparringBezig}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Sturen
                </button>
              </div>

              {berichten.filter((b) => b.rol === 'gebruiker').length >= 2 && !sparringKlassificatie && (
                <button
                  onClick={classificeerSparring}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  Verwerk als element →
                </button>
              )}

              {sparringKlassificatie && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-purple-800 mb-2">
                    AI stelt voor: <span className="text-purple-600">{doelType.replace(/_/g, ' ')}</span>
                  </p>
                  <input
                    type="text"
                    value={sparringTitel}
                    onChange={(e) => setSparringTitel(e.target.value)}
                    placeholder="Geef dit element een titel..."
                    className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    onClick={slaaSparringOp}
                    disabled={!sparringTitel.trim() || sparringOpslaanBezig}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    {sparringOpslaanBezig ? 'Opslaan...' : 'Element opslaan + koppel'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
