'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { aiApi, elementenApi } from '@/lib/api';

const ELEMENT_TYPEN = [
  { waarde: 'VISIE', label: 'Visie', beschrijving: 'Een toekomstgerichte ambitie of richting' },
  { waarde: 'PRINCIPE', label: 'Principe', beschrijving: 'Een leidend principe of standaard' },
  { waarde: 'EPIC', label: 'Epic', beschrijving: 'Een groot initiatief of thema' },
  { waarde: 'MODULE', label: 'Module', beschrijving: 'Een afgebakend onderdeel van het systeem' },
  { waarde: 'FUNCTIONALITEIT', label: 'Functionaliteit', beschrijving: 'Een concrete functionaliteit' },
  { waarde: 'FUNCTIONEEL_ONTWERP', label: 'Functioneel Ontwerp', beschrijving: 'Functionele uitwerking van een feature' },
  { waarde: 'TECHNISCH_ONTWERP', label: 'Technisch Ontwerp', beschrijving: 'Technische architectuur of ontwerp' },
  { waarde: 'USER_STORY', label: 'User Story', beschrijving: 'Een gebruikersverhaal (Als... wil ik... zodat...)' },
  { waarde: 'API_CONTRACT', label: 'API Contract', beschrijving: 'Een API-specificatie of interface-definitie' },
  { waarde: 'DATAMODEL', label: 'Datamodel', beschrijving: 'Een datastructuur of entiteitsdefinitie' },
];

interface Bericht {
  rol: 'gebruiker' | 'ai';
  inhoud: string;
}

export default function InzendingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Laden...</div>}>
      <InzendingContent />
    </Suspense>
  );
}

function InzendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'sparring' ? 'sparring' : 'handmatig';
  const [activeTab, setActiveTab] = useState<'sparring' | 'handmatig'>(defaultTab as any);

  // Sparring tab state
  const [berichten, setBerichten] = useState<Bericht[]>([
    { rol: 'ai', inhoud: 'Welkom! Vertel me over uw idee voor zorginnovatie. Wat wilt u verbeteren of veranderen in de zorg?' },
  ]);
  const [invoer, setInvoer] = useState('');
  const [verzendBezig, setVerzendBezig] = useState(false);
  const [classificatie, setClassificatie] = useState<{ type: string; toelichting: string; vertrouwen: number } | null>(null);
  const [classificeerBezig, setClassificeerBezig] = useState(false);
  const [bevestigTitel, setBevestigTitel] = useState('');
  const [bevestigBezig, setBevestigBezig] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Handmatig tab state
  const [handTitel, setHandTitel] = useState('');
  const [handType, setHandType] = useState('FUNCTIONALITEIT');
  const [handInhoud, setHandInhoud] = useState('');
  const [handToelichting, setHandToelichting] = useState('');
  const [handBezig, setHandBezig] = useState(false);

  useEffect(() => {
    const context = sessionStorage.getItem('sparring_context');
    if (context && activeTab === 'sparring') {
      setInvoer(context);
      sessionStorage.removeItem('sparring_context');
    }
  }, [activeTab]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [berichten]);

  const verstuurBericht = async () => {
    if (!invoer.trim() || verzendBezig) return;
    const vraag = invoer.trim();
    setInvoer('');
    setBerichten((prev) => [...prev, { rol: 'gebruiker', inhoud: vraag }]);
    setVerzendBezig(true);
    setClassificatie(null);
    try {
      const gesprekGeschiedenis = berichten.map((b) => ({ rol: b.rol === 'gebruiker' ? 'gebruiker' : 'ai', inhoud: b.inhoud }));
      const res = await aiApi.sparring({ nieuweVraag: vraag, gesprekGeschiedenis });
      const antwoord = res.data as any;
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: antwoord.inhoud }]);
    } catch {
      setBerichten((prev) => [...prev, { rol: 'ai', inhoud: 'Er trad een fout op. Probeer het opnieuw.' }]);
    } finally {
      setVerzendBezig(false);
    }
  };

  const classificeerGesprek = async () => {
    setClassificeerBezig(true);
    const gesprekTekst = berichten
      .filter((b) => b.rol === 'gebruiker')
      .map((b) => b.inhoud)
      .join(' ');
    try {
      const res = await aiApi.classificeer(gesprekTekst);
      setClassificatie(res.data as any);
      setBevestigTitel('');
    } catch {
      alert('Fout bij classificeren. Probeer het opnieuw.');
    } finally {
      setClassificeerBezig(false);
    }
  };

  const bevestigElement = async () => {
    if (!classificatie || !bevestigTitel.trim()) return;
    setBevestigBezig(true);
    const gesprekTekst = berichten.map((b) => `${b.rol === 'gebruiker' ? 'Gebruiker' : 'AI'}: ${b.inhoud}`).join('\n\n');
    try {
      const res = await elementenApi.maak({
        titel: bevestigTitel.trim(),
        type: classificatie.type,
        inhoud: gesprekTekst,
        toelichting: classificatie.toelichting,
      });
      router.push(`/elementen/${res.data.id}`);
    } catch {
      alert('Fout bij opslaan. Probeer het opnieuw.');
      setBevestigBezig(false);
    }
  };

  const maakHandmatig = async () => {
    if (!handTitel.trim() || !handInhoud.trim()) return;
    setHandBezig(true);
    try {
      const res = await elementenApi.maak({
        titel: handTitel.trim(),
        type: handType,
        inhoud: handInhoud.trim(),
        toelichting: handToelichting.trim() || undefined,
      });
      router.push(`/elementen/${res.data.id}`);
    } catch {
      alert('Fout bij opslaan. Probeer het opnieuw.');
      setHandBezig(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nieuw Element</h1>
        <p className="text-gray-500 text-sm mt-1">
          Voeg een nieuw idee, principe, user story of ander element toe aan CareCanvas
        </p>
      </div>

      {/* Tabbladen */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sparring')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'sparring'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Via Sparring-Partner
        </button>
        <button
          onClick={() => setActiveTab('handmatig')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'handmatig'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Handmatig
        </button>
      </div>

      {/* Sparring tab */}
      {activeTab === 'sparring' && (
        <div>
          <div
            ref={chatRef}
            className="bg-white border border-gray-100 rounded-xl p-4 h-80 overflow-y-auto mb-4 space-y-3"
          >
            {berichten.map((b, i) => (
              <div key={i} className={`flex ${b.rol === 'gebruiker' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    b.rol === 'gebruiker'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {b.inhoud}
                </div>
              </div>
            ))}
            {verzendBezig && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400">
                  Denkt na...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={invoer}
              onChange={(e) => setInvoer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && verstuurBericht()}
              placeholder="Typ uw bericht..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={verstuurBericht}
              disabled={!invoer.trim() || verzendBezig}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Sturen
            </button>
          </div>

          {berichten.filter((b) => b.rol === 'gebruiker').length >= 2 && !classificatie && (
            <button
              onClick={classificeerGesprek}
              disabled={classificeerBezig}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {classificeerBezig ? 'Classificeren...' : 'Verwerk gesprek als element →'}
            </button>
          )}

          {classificatie && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-purple-800 mb-1">
                AI stelt voor: <span className="text-purple-600">{classificatie.type.replace(/_/g, ' ')}</span>
                <span className="ml-2 text-xs text-purple-500">({Math.round(classificatie.vertrouwen * 100)}% vertrouwen)</span>
              </p>
              <p className="text-sm text-purple-700 mb-4">{classificatie.toelichting}</p>
              <input
                type="text"
                value={bevestigTitel}
                onChange={(e) => setBevestigTitel(e.target.value)}
                placeholder="Geef dit element een titel..."
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={bevestigElement}
                  disabled={!bevestigTitel.trim() || bevestigBezig}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  {bevestigBezig ? 'Opslaan...' : 'Element opslaan'}
                </button>
                <button
                  onClick={() => setClassificatie(null)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Handmatig tab */}
      {activeTab === 'handmatig' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              value={handTitel}
              onChange={(e) => setHandTitel(e.target.value)}
              placeholder="Geef het element een duidelijke titel..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={handType}
              onChange={(e) => setHandType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ELEMENT_TYPEN.map((t) => (
                <option key={t.waarde} value={t.waarde}>
                  {t.label} — {t.beschrijving}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud *</label>
            <textarea
              value={handInhoud}
              onChange={(e) => setHandInhoud(e.target.value)}
              rows={6}
              placeholder="Beschrijf het element zo concreet mogelijk..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Toelichting (optioneel)</label>
            <textarea
              value={handToelichting}
              onChange={(e) => setHandToelichting(e.target.value)}
              rows={3}
              placeholder="Extra context, aanleiding of rationale..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={maakHandmatig}
            disabled={!handTitel.trim() || !handInhoud.trim() || handBezig}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            {handBezig ? 'Opslaan...' : 'Element aanmaken'}
          </button>
        </div>
      )}
    </div>
  );
}
