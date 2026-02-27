'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { aiApi, elementenApi } from '@/lib/api';

const ELEMENT_TYPEN = [
  'VISIE', 'PRINCIPE', 'EPIC', 'MODULE', 'FUNCTIONALITEIT',
  'FUNCTIONEEL_ONTWERP', 'TECHNISCH_ONTWERP', 'USER_STORY', 'API_CONTRACT', 'DATAMODEL',
];

interface Bericht {
  rol: 'gebruiker' | 'ai';
  inhoud: string;
  tijdstip: Date;
  aiProvider?: string;
  aiModel?: string;
}

interface ElementVoorstel {
  titel: string;
  type: string;
  inhoud: string;
  toelichting: string;
}

export default function SparringPage() {
  const router = useRouter();

  // ── Modus: gesprek of document ──
  const [modus, setModus] = useState<'gesprek' | 'document'>('gesprek');

  // ── Gesprek state ──
  const [berichten, setBerichten] = useState<Bericht[]>([
    {
      rol: 'ai',
      inhoud: 'Goedendag! Ik ben uw Sparring-Partner. Deel uw zorgvisie of beschrijf een probleem dat u dagelijks tegenkomt in de zorgpraktijk. Ik help u dit te verdiepen tot een concreet element.',
      tijdstip: new Date(),
    },
  ]);
  const [invoer, setInvoer] = useState('');
  const [bezig, setBezig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Document state ──
  const [documentTekst, setDocumentTekst] = useState('');
  const [documentBezig, setDocumentBezig] = useState(false);
  const [documentElementen, setDocumentElementen] = useState<ElementVoorstel[]>([]);
  const [geselecteerdeElementen, setGeselecteerdeElementen] = useState<Set<number>>(new Set());
  const [documentAangemaaktIds, setDocumentAangemaaktIds] = useState<string[]>([]);

  // ── Live element-concept (rechter panel) ──
  const [elementVoorstel, setElementVoorstel] = useState<ElementVoorstel | null>(null);
  const [bewerktVoorstel, setBewerktVoorstel] = useState<ElementVoorstel | null>(null);
  const [aanmaakBezig, setAanmaakBezig] = useState(false);
  const [aangemaaktId, setAangemaaktId] = useState<string | null>(null);
  const [isElementKlaar, setIsElementKlaar] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten]);

  // Sync bewerkbaar voorstel wanneer AI een nieuw voorstel geeft
  useEffect(() => {
    if (!elementVoorstel) return;
    setBewerktVoorstel((prev) =>
      prev
        // Bewaar eigen aanpassingen aan titel/toelichting; update alleen inhoud en type
        ? { ...elementVoorstel, titel: prev.titel, toelichting: prev.toelichting }
        : { ...elementVoorstel }
    );
  }, [elementVoorstel]);

  // ── Gesprek: bericht sturen ──
  const stuurBericht = async () => {
    if (!invoer.trim() || bezig) return;

    const gebruikersBericht: Bericht = { rol: 'gebruiker', inhoud: invoer, tijdstip: new Date() };
    setBerichten((prev) => [...prev, gebruikersBericht]);
    const localInvoer = invoer;
    setInvoer('');
    setBezig(true);

    try {
      const res = await aiApi.sparring({
        nieuweVraag: localInvoer,
        gesprekGeschiedenis: berichten.map((b) => ({ rol: b.rol, inhoud: b.inhoud })),
      });

      const data = res.data as any;
      setBerichten((prev) => [...prev, {
        rol: 'ai',
        inhoud: data.inhoud,
        tijdstip: new Date(),
        aiProvider: data.aiProvider,
        aiModel: data.aiModel,
      }]);

      if (data.elementVoorstel) {
        setElementVoorstel(data.elementVoorstel);
      }
      if (data.isProbleemFormuleringKlaar) {
        setIsElementKlaar(true);
      }
    } catch (err: any) {
      let melding = 'Excuses, er is iets misgegaan. Probeer het opnieuw.';
      if (!err?.response) {
        melding = 'De API is niet bereikbaar. Controleer of de backend draait op poort 4001.';
      } else if (err?.response?.status === 401) {
        melding = 'Uw sessie is verlopen. Meld u opnieuw aan.';
        setTimeout(() => { window.location.href = '/auth/login'; }, 2000);
      }
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: melding, tijdstip: new Date() }]);
    } finally {
      setBezig(false);
    }
  };

  // ── Element aanmaken vanuit gesprek ──
  const maakElementAan = async () => {
    if (!bewerktVoorstel || aanmaakBezig) return;
    setAanmaakBezig(true);
    try {
      const res = await elementenApi.maak({
        titel: bewerktVoorstel.titel,
        type: bewerktVoorstel.type,
        inhoud: bewerktVoorstel.inhoud,
        toelichting: bewerktVoorstel.toelichting || undefined,
      });
      setAangemaaktId(res.data.id);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Fout bij aanmaken element');
    } finally {
      setAanmaakBezig(false);
    }
  };

  // ── Document: verwerken ──
  const verwerkDocument = async () => {
    if (!documentTekst.trim() || documentBezig) return;
    setDocumentBezig(true);
    setDocumentElementen([]);
    setGeselecteerdeElementen(new Set());
    setDocumentAangemaaktIds([]);
    try {
      const res = await aiApi.documentNaarElementen(documentTekst);
      const elementen = res.data as ElementVoorstel[];
      setDocumentElementen(elementen);
      setGeselecteerdeElementen(new Set(elementen.map((_, i) => i)));
    } catch {
      alert('Fout bij verwerken document. Probeer het opnieuw.');
    } finally {
      setDocumentBezig(false);
    }
  };

  const toggleSelecteerElement = (index: number) => {
    setGeselecteerdeElementen((prev) => {
      const nieuw = new Set(prev);
      nieuw.has(index) ? nieuw.delete(index) : nieuw.add(index);
      return nieuw;
    });
  };

  const maakGeselecteerdeElementenAan = async () => {
    const teAanmaken = documentElementen.filter((_, i) => geselecteerdeElementen.has(i));
    if (teAanmaken.length === 0) return;
    setAanmaakBezig(true);
    try {
      const resultaten = await Promise.allSettled(
        teAanmaken.map((el) => elementenApi.maak({
          titel: el.titel,
          type: el.type,
          inhoud: el.inhoud,
          toelichting: el.toelichting || undefined,
        }))
      );
      const ids = resultaten
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value.data.id);
      setDocumentAangemaaktIds(ids);
    } catch {
      alert('Fout bij aanmaken elementen');
    } finally {
      setAanmaakBezig(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header met modus-toggle */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sparring-Partner</h1>
          <p className="text-sm text-gray-500">Van idee naar element — via gesprek of document</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setModus('gesprek')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              modus === 'gesprek' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gesprek
          </button>
          <button
            onClick={() => setModus('document')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              modus === 'document' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Document verwerken
          </button>
        </div>
      </div>

      {/* ── GESPREK MODUS ── */}
      {modus === 'gesprek' && (
        <div className="flex flex-1 overflow-hidden">

          {/* Linker kolom: chat */}
          <div className={`flex flex-col ${elementVoorstel ? 'w-1/2' : 'flex-1'} transition-all duration-300`}>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {berichten.map((bericht, i) => (
                <div key={i} className={`flex flex-col ${bericht.rol === 'gebruiker' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-lg rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    bericht.rol === 'gebruiker'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-100 text-gray-800'
                  }`}>
                    {bericht.rol === 'ai' && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-xs text-gray-400 font-medium">Sparring-Partner AI</p>
                        {bericht.aiProvider && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            bericht.aiProvider === 'claude'
                              ? 'bg-orange-100 text-orange-700'
                              : bericht.aiProvider === 'mock'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {bericht.aiProvider === 'claude'
                              ? `Claude · ${bericht.aiModel}`
                              : bericht.aiProvider === 'mock'
                              ? 'Demo-modus'
                              : `Gemini · ${bericht.aiModel}`}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{bericht.inhoud}</p>
                  </div>
                </div>
              ))}
              {bezig && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm text-gray-400 flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    Denkt na...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0">
              <div className="flex gap-3">
                <textarea
                  value={invoer}
                  onChange={(e) => setInvoer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); stuurBericht(); }
                  }}
                  placeholder="Beschrijf uw zorgidee of probleem... (Enter om te sturen)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={stuurBericht}
                  disabled={bezig || !invoer.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 rounded-xl transition-colors"
                >
                  Stuur
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Voer geen patiëntidentificeerbare gegevens in. De AI reageert in het Nederlands.
              </p>
            </div>
          </div>

          {/* Rechter kolom: live element-concept */}
          {bewerktVoorstel && (
            <div className="w-1/2 flex flex-col border-l border-gray-200 bg-gray-50">
              {/* Panel header */}
              <div className={`px-6 py-4 border-b border-gray-200 shrink-0 flex items-center justify-between transition-colors ${
                isElementKlaar && !aangemaaktId ? 'bg-green-50' : 'bg-white'
              }`}>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Element concept</p>
                  <p className={`text-xs mt-0.5 ${isElementKlaar && !aangemaaktId ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {aangemaaktId
                      ? 'Aangemaakt'
                      : isElementKlaar
                      ? 'Klaar om op te slaan — pas eventueel aan en klik op "Element aanmaken"'
                      : 'Wordt bijgewerkt met het gesprek'}
                  </p>
                </div>
                {aangemaaktId
                  ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Aangemaakt</span>
                  : isElementKlaar
                  ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Klaar</span>
                  : <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full animate-pulse">Live</span>
                }
              </div>

              {/* Velden */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                  <select
                    value={bewerktVoorstel.type}
                    onChange={(e) => setBewerktVoorstel({ ...bewerktVoorstel, type: e.target.value })}
                    disabled={!!aangemaaktId}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {ELEMENT_TYPEN.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titel</label>
                  <input
                    type="text"
                    value={bewerktVoorstel.titel}
                    onChange={(e) => setBewerktVoorstel({ ...bewerktVoorstel, titel: e.target.value })}
                    disabled={!!aangemaaktId}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Toelichting <span className="font-normal text-gray-400 normal-case">(optioneel)</span>
                  </label>
                  <input
                    type="text"
                    value={bewerktVoorstel.toelichting}
                    onChange={(e) => setBewerktVoorstel({ ...bewerktVoorstel, toelichting: e.target.value })}
                    disabled={!!aangemaaktId}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Inhoud</label>
                  <textarea
                    value={bewerktVoorstel.inhoud}
                    onChange={(e) => setBewerktVoorstel({ ...bewerktVoorstel, inhoud: e.target.value })}
                    disabled={!!aangemaaktId}
                    rows={12}
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Acties */}
              <div className="p-5 bg-white border-t border-gray-200 shrink-0">
                {!aangemaaktId ? (
                  <button
                    onClick={maakElementAan}
                    disabled={aanmaakBezig || !bewerktVoorstel.titel.trim() || !bewerktVoorstel.inhoud.trim()}
                    className={`w-full disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-all ${
                      isElementKlaar
                        ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-200'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {aanmaakBezig ? 'Aanmaken...' : isElementKlaar ? '✓ Element aanmaken →' : 'Element aanmaken →'}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/elementen/${aangemaaktId}`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                    >
                      Bekijk element →
                    </button>
                    <button
                      onClick={() => {
                        setAangemaaktId(null);
                        setElementVoorstel(null);
                        setBewerktVoorstel(null);
                        setIsElementKlaar(false);
                        setBerichten([{ rol: 'ai', inhoud: 'Element aangemaakt! Wilt u over een nieuw idee sparren?', tijdstip: new Date() }]);
                      }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors text-center"
                    >
                      Nieuw gesprek starten
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DOCUMENT MODUS ── */}
      {modus === 'document' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Links: invoer */}
          <div className="flex flex-col w-1/2 border-r border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Document plakken</h2>
              <p className="text-xs text-gray-500">
                Functioneel ontwerp, beleidsnotitie, vergaderverslag — de AI extraheert de relevante elementen.
              </p>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4">
              <textarea
                value={documentTekst}
                onChange={(e) => setDocumentTekst(e.target.value)}
                placeholder="Plak hier uw document..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={verwerkDocument}
                disabled={documentBezig || !documentTekst.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shrink-0"
              >
                {documentBezig ? 'Verwerken...' : 'Extraheer elementen →'}
              </button>
            </div>
          </div>

          {/* Rechts: gevonden elementen */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
            {documentAangemaaktIds.length > 0 ? (
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    {documentAangemaaktIds.length} element{documentAangemaaktIds.length !== 1 ? 'en' : ''} aangemaakt
                  </p>
                  <p className="text-xs text-green-600 mb-3">U vindt ze terug in het elementenoverzicht.</p>
                  <div className="flex gap-2">
                    <button onClick={() => router.push('/elementen')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      Naar elementen →
                    </button>
                    <button
                      onClick={() => { setDocumentAangemaaktIds([]); setDocumentElementen([]); setDocumentTekst(''); }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors"
                    >
                      Nieuw document
                    </button>
                  </div>
                </div>
              </div>
            ) : documentElementen.length > 0 ? (
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{documentElementen.length} elementen gevonden</p>
                    <p className="text-xs text-gray-500">{geselecteerdeElementen.size} geselecteerd</p>
                  </div>
                  <button
                    onClick={maakGeselecteerdeElementenAan}
                    disabled={aanmaakBezig || geselecteerdeElementen.size === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                  >
                    {aanmaakBezig ? 'Aanmaken...' : `Maak ${geselecteerdeElementen.size} aan →`}
                  </button>
                </div>

                {documentElementen.map((el, i) => (
                  <div
                    key={i}
                    onClick={() => toggleSelecteerElement(i)}
                    className={`bg-white border rounded-xl p-4 cursor-pointer transition-colors ${
                      geselecteerdeElementen.has(i) ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        geselecteerdeElementen.has(i) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {geselecteerdeElementen.has(i) && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1.5 inline-block">
                          {el.type.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">{el.titel}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{el.toelichting}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 h-full flex items-center justify-center p-12 text-center">
                <div>
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Plak een document links</p>
                  <p className="text-xs text-gray-400 max-w-xs">
                    De AI herkent VISIE, PRINCIPE, EPIC, MODULE, FUNCTIONALITEIT en andere element-types in uw tekst
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
