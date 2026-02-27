'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { elementenApi } from '@/lib/api';

const TYPE_KLEUREN: Record<string, string> = {
  VISIE: 'bg-purple-100 text-purple-700 border-purple-200',
  PRINCIPE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  EPIC: 'bg-blue-100 text-blue-700 border-blue-200',
  MODULE: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  FUNCTIONALITEIT: 'bg-teal-100 text-teal-700 border-teal-200',
  FUNCTIONEEL_ONTWERP: 'bg-green-100 text-green-700 border-green-200',
  TECHNISCH_ONTWERP: 'bg-lime-100 text-lime-700 border-lime-200',
  USER_STORY: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  API_CONTRACT: 'bg-orange-100 text-orange-700 border-orange-200',
  DATAMODEL: 'bg-red-100 text-red-700 border-red-200',
};

const HIEARCHIE_GROEPEN: { label: string; typen: string[]; beschrijving: string }[] = [
  {
    label: 'Strategisch fundament',
    typen: ['VISIE', 'PRINCIPE'],
    beschrijving: 'Vastgestelde visies en principes vormen de basis van het systeem',
  },
  {
    label: 'Productstructuur',
    typen: ['EPIC', 'MODULE'],
    beschrijving: 'Gepubliceerde epics en modules definiëren de systeemstructuur',
  },
  {
    label: 'Functionaliteiten & Ontwerpen',
    typen: ['FUNCTIONALITEIT', 'FUNCTIONEEL_ONTWERP', 'TECHNISCH_ONTWERP'],
    beschrijving: 'Gereed verklaarde functionaliteiten en ontwerpen',
  },
  {
    label: 'Implementatiespecificaties',
    typen: ['USER_STORY', 'API_CONTRACT', 'DATAMODEL'],
    beschrijving: 'Goedgekeurde user stories, API contracten en datamodellen',
  },
];

export default function CanvasPage() {
  const router = useRouter();
  const [elementen, setElementen] = useState<any[]>([]);
  const [bezig, setBezig] = useState(true);

  useEffect(() => {
    const laad = async () => {
      setBezig(true);
      try {
        const res = await elementenApi.vindGoedgekeurd();
        setElementen(res.data as any[]);
      } finally {
        setBezig(false);
      }
    };
    laad();
  }, []);

  const elementenVoorType = (typen: string[]) =>
    elementen.filter((el) => typen.includes(el.type));

  const totaal = elementen.length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systeem Canvas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hiërarchisch overzicht van alle vastgestelde en goedgekeurde elementen
          </p>
        </div>
        {totaal > 0 && (
          <span className="text-sm bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full">
            {totaal} goedgekeur{totaal !== 1 ? 'de' : 'd'} element{totaal !== 1 ? 'en' : ''}
          </span>
        )}
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
      ) : (
        <div className="space-y-8">
          {HIEARCHIE_GROEPEN.map((groep) => {
            const groepElementen = elementenVoorType(groep.typen);
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
      )}
    </div>
  );
}
