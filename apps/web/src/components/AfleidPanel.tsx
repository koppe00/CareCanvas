'use client';

import { useEffect, useRef, useState } from 'react';
import { aiApi, elementenApi, relatiesApi } from '@/lib/api';
import { AFLEID_NAAR, ELEMENT_TYPE_LABEL, RelatieType } from '@/lib/relatie-types';

interface Props {
  bronElement: any;
  onSluit: () => void;
  onVoltooid: () => void;
}

interface Aanbeveling {
  doelType: string;
  relatieType: string;
  prioriteit: 'HOOG' | 'MIDDEL' | 'LAAG';
  redenering: string;
  voorgesteldeTitel: string;
  voorgesteldeInhoud: string;
}

interface Bericht {
  rol: 'gebruiker' | 'ai';
  inhoud: string;
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

const PRIORITEIT_BADGE: Record<string, string> = {
  HOOG: 'bg-orange-100 text-orange-700',
  MIDDEL: 'bg-yellow-100 text-yellow-700',
  LAAG: 'bg-gray-100 text-gray-500',
};

const PRIORITEIT_LABEL: Record<string, string> = {
  HOOG: 'Hoge prioriteit',
  MIDDEL: 'Middel prioriteit',
  LAAG: 'Lagere prioriteit',
};

export function AfleidPanel({ bronElement, onSluit, onVoltooid }: Props) {
  const mogelikeDoeltypen: { type: string; relatie: string }[] = (AFLEID_NAAR as any)[bronElement.type] ?? [];

  const [fase, setFase] = useState<'analyseren' | 'aanbevelingen' | 'aanmaken'>('analyseren');
  const [aanbevelingen, setAanbevelingen] = useState<Aanbeveling[]>([]);
  const [analyseError, setAnalyseError] = useState('');

  // Aanmaken-fase state
  const [gekozen, setGekozen] = useState<Aanbeveling | null>(null);
  const [draftTitel, setDraftTitel] = useState('');
  const [draftInhoud, setDraftInhoud] = useState('');
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState('');
  const [chatBezig, setChatBezig] = useState(false);
  const [opslaanBezig, setOpslaanBezig] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    analyseer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [berichten]);

  const analyseer = async () => {
    setFase('analyseren');
    setAnalyseError('');
    setAanbevelingen([]);
    try {
      const res = await aiApi.aanbevelen({ bronElement, mogelijkeAfleiding: mogelikeDoeltypen });
      setAanbevelingen((res.data as any).aanbevelingen ?? []);
    } catch {
      setAnalyseError('Fout bij analyseren. Controleer de verbinding en probeer het opnieuw.');
    } finally {
      setFase('aanbevelingen');
    }
  };

  const kiesAanbeveling = (aanbeveling: Aanbeveling) => {
    setGekozen(aanbeveling);
    setDraftTitel(aanbeveling.voorgesteldeTitel);
    setDraftInhoud(aanbeveling.voorgesteldeInhoud);
    setBerichten([
      {
        rol: 'ai',
        inhoud: `Ik heb een concept ${ELEMENT_TYPE_LABEL[aanbeveling.doelType] ?? aanbeveling.doelType} voorbereid op basis van "${bronElement.titel}". U kunt de titel en inhoud direct bewerken, of stel mij vragen om het verder te verfijnen.`,
      },
    ]);
    setFase('aanmaken');
  };

  const verstuurChat = async () => {
    if (!invoer.trim() || chatBezig || !gekozen) return;
    const vraag = invoer.trim();
    setInvoer('');
    setBerichten((prev) => [...prev, { rol: 'gebruiker', inhoud: vraag }]);
    setChatBezig(true);
    try {
      const context = `Bron-element:\nType: ${bronElement.type}\nTitel: ${bronElement.titel}\nInhoud: ${bronElement.inhoud ?? ''}\n\nHuidig concept (${gekozen.doelType}):\nTitel: ${draftTitel}\nInhoud: ${draftInhoud}`;
      const res = await aiApi.sparring({
        nieuweVraag: vraag,
        gesprekGeschiedenis: berichten.map((b) => ({
          rol: b.rol === 'gebruiker' ? 'gebruiker' : 'ai',
          inhoud: b.inhoud,
        })),
        projectContext: context,
      });
      const antwoord = res.data as any;
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: antwoord.inhoud }]);
      // Verwerk eventueel element-voorstel als het klaar is
      if (antwoord.elementVoorstel?.inhoud && antwoord.isProbleemFormuleringKlaar) {
        setDraftInhoud(antwoord.elementVoorstel.inhoud);
        if (antwoord.elementVoorstel.titel) setDraftTitel(antwoord.elementVoorstel.titel);
      }
    } catch {
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: 'Er trad een fout op. Probeer het opnieuw.' }]);
    } finally {
      setChatBezig(false);
    }
  };

  const slaOp = async () => {
    if (!draftTitel.trim() || !gekozen || opslaanBezig) return;
    setOpslaanBezig(true);
    try {
      const res = await elementenApi.maak({
        titel: draftTitel.trim(),
        type: gekozen.doelType,
        inhoud: draftInhoud,
      });
      const nieuweId = res.data.id;
      await relatiesApi.maakRelatie(nieuweId, {
        naarElementId: bronElement.id,
        relatieType: gekozen.relatieType,
      });
      onVoltooid();
    } catch {
      alert('Fout bij opslaan. Probeer het opnieuw.');
      setOpslaanBezig(false);
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
          <div className="flex items-center gap-3">
            {fase === 'aanmaken' && (
              <button
                onClick={() => setFase('aanbevelingen')}
                className="text-gray-400 hover:text-gray-700 text-sm font-medium"
              >
                ← Terug
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-gray-900">Afleiden naar →</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">van: {bronElement.titel}</p>
            </div>
          </div>
          <button onClick={onSluit} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── FASE: ANALYSEREN ── */}
          {fase === 'analyseren' && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div>
                <p className="text-sm font-semibold text-gray-800">AI analyseert het element...</p>
                <p className="text-xs text-gray-500 mt-1">
                  Bepaalt welke elementen het meest zinvol zijn om af te leiden
                </p>
              </div>
            </div>
          )}

          {/* ── FASE: AANBEVELINGEN ── */}
          {fase === 'aanbevelingen' && (
            <div>
              {analyseError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  {analyseError}
                  <button
                    onClick={analyseer}
                    className="block mt-2 text-red-600 font-semibold hover:underline text-xs"
                  >
                    Opnieuw proberen →
                  </button>
                </div>
              )}

              {aanbevelingen.length === 0 && !analyseError && (
                <div className="text-center text-gray-500 text-sm py-8">
                  <p>Geen aanbevelingen beschikbaar voor dit element.</p>
                  <button onClick={analyseer} className="mt-2 text-blue-600 font-semibold hover:underline text-xs">
                    Opnieuw analyseren →
                  </button>
                </div>
              )}

              {aanbevelingen.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    De AI heeft geanalyseerd welke elementen het meest zinvol zijn om nu af te leiden.
                    Kies een aanbeveling om door te gaan.
                  </p>
                  <div className="space-y-3">
                    {aanbevelingen.map((a, i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">
                              {ELEMENT_TYPE_LABEL[a.doelType] ?? a.doelType}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RELATIE_KLEUR[a.relatieType] ?? 'bg-gray-100 text-gray-500'}`}
                            >
                              {RELATIE_LABEL[a.relatieType] ?? a.relatieType}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${PRIORITEIT_BADGE[a.prioriteit] ?? 'bg-gray-100 text-gray-500'}`}
                          >
                            {PRIORITEIT_LABEL[a.prioriteit] ?? a.prioriteit}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{a.redenering}</p>

                        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                          <p className="text-[10px] text-gray-400 font-semibold mb-0.5">Voorgestelde titel</p>
                          <p className="text-xs text-gray-700 font-medium">{a.voorgesteldeTitel}</p>
                        </div>

                        <button
                          onClick={() => kiesAanbeveling(a)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                        >
                          Maak aan en verfijn →
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={analyseer}
                    className="mt-4 w-full text-gray-400 hover:text-gray-600 text-xs py-2 border border-dashed border-gray-200 rounded-lg transition-colors"
                  >
                    ↺ Opnieuw analyseren
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── FASE: AANMAKEN ── */}
          {fase === 'aanmaken' && gekozen && (
            <div>
              {/* Type badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-sm font-bold text-gray-900">
                  {ELEMENT_TYPE_LABEL[gekozen.doelType] ?? gekozen.doelType}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RELATIE_KLEUR[gekozen.relatieType] ?? 'bg-gray-100 text-gray-500'}`}
                >
                  {RELATIE_LABEL[gekozen.relatieType] ?? gekozen.relatieType}
                </span>
                <span className="text-[10px] text-gray-400">van: {bronElement.titel}</span>
              </div>

              {/* Bewerkbaar concept */}
              <div className="border border-gray-100 rounded-xl p-4 bg-white mb-4">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">TITEL</label>
                <input
                  type="text"
                  value={draftTitel}
                  onChange={(e) => setDraftTitel(e.target.value)}
                  className="w-full text-sm font-semibold text-gray-900 border-0 border-b border-gray-100 pb-2 mb-3 focus:outline-none focus:border-blue-300"
                  placeholder="Geef dit element een titel..."
                />
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">INHOUD</label>
                <textarea
                  value={draftInhoud}
                  onChange={(e) => setDraftInhoud(e.target.value)}
                  rows={5}
                  className="w-full text-xs text-gray-700 border-0 resize-none focus:outline-none leading-relaxed"
                  placeholder="Inhoud van het element..."
                />
              </div>

              {/* Mini-sparring voor verfijning */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 mb-2">VERFIJN MET AI</p>
                <div
                  ref={chatRef}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-44 overflow-y-auto mb-2 space-y-2"
                >
                  {berichten.map((b, i) => (
                    <div key={i} className={`flex ${b.rol === 'gebruiker' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          b.rol === 'gebruiker'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}
                      >
                        {b.inhoud}
                      </div>
                    </div>
                  ))}
                  {chatBezig && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-gray-400">
                        Denkt na...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoer}
                    onChange={(e) => setInvoer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && verstuurChat()}
                    placeholder="Stel een vraag of vraag om aanpassing..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={verstuurChat}
                    disabled={!invoer.trim() || chatBezig}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Opslaan */}
              <button
                onClick={slaOp}
                disabled={!draftTitel.trim() || opslaanBezig}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {opslaanBezig ? 'Opslaan...' : 'Opslaan en koppel →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
