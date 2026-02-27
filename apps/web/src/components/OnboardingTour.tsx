'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TOUR_KEY = 'carecanvas_tour_v2';

interface TourState {
  actief: boolean;
  stap: number; // -1 = welcome popup, 0..N-1 = active steps, N = done
  geminimaliseerd: boolean;
}

interface TourStap {
  icon: string;
  titel: string;
  taak: string;
  hint: string;
  navigeerNaar?: string;
  navigeerLabel?: string;
  voltooiPad?: (pathname: string) => boolean; // auto-advance when true
  handmatig?: boolean; // requires "Klaar" button press
}

const STAPPEN: TourStap[] = [
  {
    icon: '🤖',
    titel: 'Maak kennis met de Sparring-Partner',
    taak: 'Stel een vraag aan de Sparring-Partner AI',
    hint: 'Typ een idee of vraag in het tekstvak onderaan en klik op "Sturen". De AI reageert met verdiepende vragen om uw idee te verkennen. Probeer bijv. "Ik wil medicijnverstrekking digitaliseren."',
    navigeerNaar: '/sparring',
    navigeerLabel: 'Open Sparring-Partner',
    handmatig: true,
  },
  {
    icon: '🧱',
    titel: 'Maak uw eerste element aan',
    taak: 'Maak een nieuw element via Inzending → Handmatig',
    hint: 'Ga naar Inzending, kies het tabblad "Handmatig", vul een titel en beschrijving in en klik op "Element aanmaken". U wordt automatisch doorgestuurd naar het nieuwe element.',
    navigeerNaar: '/inzending',
    navigeerLabel: 'Naar Inzending',
    voltooiPad: (p) => p.startsWith('/elementen/') && p.split('/').filter(Boolean).length >= 2,
  },
  {
    icon: '🔍',
    titel: 'Verken uw element',
    taak: 'Bekijk de workflow, discussie en stemmen',
    hint: 'Scroll door de detailpagina. Bekijk de workflow-voortgangsbalk. Klik op de tabbladen "Discussie" en "Stemmen" om te zien hoe collega\'s kunnen reageren en stemmen.',
    handmatig: true,
  },
  {
    icon: '📋',
    titel: 'Elementen-overzicht',
    taak: 'Open het overzicht van al uw elementen',
    hint: 'Het overzicht toont alle elementen met type, status en datum. Gebruik de filters bovenaan om te zoeken op type of status. Klik een element aan om de details te zien.',
    navigeerNaar: '/elementen',
    navigeerLabel: 'Naar Elementen',
    voltooiPad: (p) => p === '/elementen',
  },
  {
    icon: '🗺️',
    titel: 'Systeem Canvas',
    taak: 'Open het Systeem Canvas',
    hint: 'Het Canvas toont alle vastgestelde elementen hiërarchisch gerangschikt — van Visies tot User Stories. Elementen verschijnen hier zodra een beheerder ze vaststelt.',
    navigeerNaar: '/canvas',
    navigeerLabel: 'Naar Canvas',
    voltooiPad: (p) => p === '/canvas',
  },
  {
    icon: '📚',
    titel: 'Bibliotheek verkennen',
    taak: 'Bezoek de Bibliotheek met herbruikbare elementen',
    hint: 'De bibliotheek toont gepubliceerde elementen als inspiratie. Klik op een element om de details te zien, of kopieer een community bouwblok als startpunt voor uw eigen werk.',
    navigeerNaar: '/library',
    navigeerLabel: 'Naar Bibliotheek',
    voltooiPad: (p) => p === '/library',
  },
];

function laadTourState(): TourState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TourState;
  } catch {
    return null;
  }
}

function slaaTourOp(state: TourState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOUR_KEY, JSON.stringify(state));
}

export function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<TourState | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load tour state from localStorage on mount (delayed so page renders first)
  useEffect(() => {
    const t = setTimeout(() => {
      const opgeslagen = laadTourState();
      if (opgeslagen === null) {
        // First time: show welcome popup
        setState({ actief: false, stap: -1, geminimaliseerd: false });
      } else {
        setState(opgeslagen);
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Persist state to localStorage on every change
  useEffect(() => {
    if (state) slaaTourOp(state);
  }, [state]);

  // Auto-complete step when user navigates to the target page
  useEffect(() => {
    if (!state?.actief || state.stap < 0 || state.stap >= STAPPEN.length) return;
    const stap = STAPPEN[state.stap];
    if (!stap.voltooiPad || !stap.voltooiPad(pathname)) return;

    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      setState((prev) => (prev ? { ...prev, stap: prev.stap + 1 } : prev));
    }, 2500);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [pathname, state?.actief, state?.stap]);

  const startTour = useCallback(() => {
    const nieuw: TourState = { actief: true, stap: 0, geminimaliseerd: false };
    setState(nieuw);
  }, []);

  const sluitTour = useCallback(() => {
    setState((prev) =>
      prev ? { ...prev, actief: false, stap: Math.max(prev.stap, STAPPEN.length) } : prev,
    );
  }, []);

  const volgende = useCallback(() => {
    setState((prev) => (prev ? { ...prev, stap: prev.stap + 1 } : prev));
  }, []);

  const toggleMinimaliseer = useCallback(() => {
    setState((prev) => (prev ? { ...prev, geminimaliseerd: !prev.geminimaliseerd } : prev));
  }, []);

  if (!state) return null;

  // ── Welcome popup ─────────────────────────────────────────────────────────
  if (!state.actief && state.stap === -1) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-xs w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl leading-none">🎯</span>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Welkom bij CareCanvas!</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Volg de interactieve rondleiding en leer het platform kennen via 6 echte opdrachten.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startTour}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              Start rondleiding →
            </button>
            <button
              onClick={sluitTour}
              className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Overslaan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tour done or dismissed ─────────────────────────────────────────────────
  if (!state.actief) return null;

  // ── Completion screen ──────────────────────────────────────────────────────
  if (state.stap >= STAPPEN.length) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-xs w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-bold text-gray-900 mb-1">Rondleiding voltooid!</h3>
          <p className="text-sm text-gray-500 mb-4">
            U kent nu alle functies van CareCanvas. Succes met uw eerste zorginnovatie!
          </p>
          <button
            onClick={sluitTour}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
          >
            Aan de slag! 🚀
          </button>
        </div>
      </div>
    );
  }

  const huidigStap = STAPPEN[state.stap];
  const isOpDoelPagina = huidigStap.navigeerNaar
    ? pathname === huidigStap.navigeerNaar
    : false;
  const heeftVoltooiMatch = huidigStap.voltooiPad
    ? huidigStap.voltooiPad(pathname)
    : false;

  // Derived button visibility
  const showNavigate = !!huidigStap.navigeerNaar && !isOpDoelPagina && !heeftVoltooiMatch;
  const showKlaar = !!huidigStap.handmatig && !heeftVoltooiMatch;
  const showWacht = !showNavigate && !showKlaar && !heeftVoltooiMatch;

  // ── Minimized pill ─────────────────────────────────────────────────────────
  if (state.geminimaliseerd) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleMinimaliseer}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-colors flex items-center gap-2"
        >
          <span>🎯</span>
          <span>
            Rondleiding — stap {state.stap + 1}/{STAPPEN.length}
          </span>
          <span className="text-blue-300 text-xs">▲</span>
        </button>
      </div>
    );
  }

  // ── Active tour widget ─────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((state.stap + 1) / STAPPEN.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{huidigStap.icon}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Stap {state.stap + 1} / {STAPPEN.length}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleMinimaliseer}
                title="Minimaliseren"
                className="text-gray-300 hover:text-gray-500 transition-colors px-1.5 py-1 text-xs"
              >
                ▼
              </button>
              <button
                onClick={sluitTour}
                title="Tour stoppen"
                className="text-gray-300 hover:text-gray-500 transition-colors px-1.5 py-1 text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Step title */}
          <h3 className="font-bold text-gray-900 text-sm mb-2">{huidigStap.titel}</h3>

          {/* Task badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">📌 Opdracht</p>
            <p className="text-sm font-medium text-amber-900">{huidigStap.taak}</p>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-500 leading-relaxed mb-4">{huidigStap.hint}</p>

          {/* Action area */}
          <div className="flex gap-2">
            {heeftVoltooiMatch && (
              <div className="flex-1 flex items-center justify-center gap-1.5 text-green-600 text-xs font-semibold py-2 bg-green-50 rounded-lg">
                <span className="animate-spin inline-block">↻</span>
                Stap voltooid, laden...
              </div>
            )}

            {showNavigate && (
              <button
                onClick={() => router.push(huidigStap.navigeerNaar!)}
                className={`text-sm font-semibold py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white ${showKlaar ? 'flex-none px-4' : 'flex-1'}`}
              >
                {huidigStap.navigeerLabel} →
              </button>
            )}

            {showKlaar && (
              <button
                onClick={volgende}
                className={`text-sm font-semibold py-2 rounded-lg transition-colors ${
                  showNavigate
                    ? 'flex-none px-4 bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'flex-1 bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                ✓ {showNavigate ? 'Klaar' : 'Gedaan, volgende →'}
              </button>
            )}

            {showWacht && (
              <div className="flex-1 text-center text-xs text-gray-400 italic py-2">
                Voer de opdracht uit om verder te gaan...
              </div>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {STAPPEN.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < state.stap
                    ? 'w-2 h-2 bg-green-500'
                    : i === state.stap
                      ? 'w-4 h-2 bg-blue-600'
                      : 'w-2 h-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
