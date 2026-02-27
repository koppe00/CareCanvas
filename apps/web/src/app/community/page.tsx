'use client';

import { useEffect, useState } from 'react';
import { communityApi } from '@/lib/api';

const ROL_KLEUREN: Record<string, string> = {
  DROMER: 'bg-purple-100 text-purple-800',
  GIDS: 'bg-blue-100 text-blue-800',
  ARCHITECT: 'bg-green-100 text-green-800',
  BOUWER: 'bg-orange-100 text-orange-800',
  VALIDATOR: 'bg-red-100 text-red-800',
  BEHEERDER: 'bg-gray-100 text-gray-800',
};

export default function CommunityPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [zoekRol, setZoekRol] = useState('GIDS');
  const [bezig, setBezig] = useState(false);

  const zoekExperts = async () => {
    setBezig(true);
    try {
      const res = await communityApi.vindExperts(zoekRol);
      setExperts(res.data ?? []);
    } finally {
      setBezig(false);
    }
  };

  useEffect(() => { zoekExperts(); }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Community & Rol-Matching</h1>
        <p className="text-gray-500 text-sm mt-1">
          Vind de juiste experts voor uw project
        </p>
      </div>

      {/* Zoekfilter */}
      <div className="flex gap-3 mb-8">
        <select
          value={zoekRol}
          onChange={(e) => setZoekRol(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(ROL_KLEUREN).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={zoekExperts}
          disabled={bezig}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {bezig ? 'Zoeken...' : 'Zoek experts'}
        </button>
      </div>

      {/* Stempeltypen */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Validatiestempels</h2>
        <p className="text-sm text-gray-500 mb-4">
          Gekwalificeerde experts kunnen formele stempels afgeven op projectartefacten.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { type: 'MEDISCH_VEILIG', door: 'BIG-geregistreerde zorgverlener', kleur: 'bg-red-50 border-red-100' },
            { type: 'PRIVACY_CONFORM', door: 'Functionaris Gegevensbescherming', kleur: 'bg-blue-50 border-blue-100' },
            { type: 'PATIENT_GEVALIDEERD', door: 'Patiëntvertegenwoordiger', kleur: 'bg-purple-50 border-purple-100' },
            { type: 'TECHNISCH_HAALBAAR', door: 'Senior Architect of Lead Developer', kleur: 'bg-green-50 border-green-100' },
            { type: 'FHIR_COMPLIANT', door: 'HL7 NL gecertificeerde specialist', kleur: 'bg-teal-50 border-teal-100' },
          ].map((s) => (
            <div key={s.type} className={`border rounded-lg p-4 ${s.kleur}`}>
              <p className="font-semibold text-sm text-gray-900">✓ {s.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-gray-500 mt-1">Afgegeven door: {s.door}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experts */}
      {experts.length > 0 ? (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">
            Beschikbare {zoekRol}-experts ({experts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experts.map((expert) => (
              <div key={expert.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                    {expert.naam?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expert.naam}</p>
                    <p className="text-xs text-gray-500">{expert.organisatie ?? 'Onbekende organisatie'}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {expert.rollen?.map((rol: string) => (
                    <span key={rol} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROL_KLEUREN[rol] ?? 'bg-gray-100 text-gray-700'}`}>
                      {rol}
                    </span>
                  ))}
                </div>
                {expert.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{expert.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : !bezig ? (
        <p className="text-gray-400 text-sm">Geen experts gevonden voor de geselecteerde rol.</p>
      ) : null}
    </div>
  );
}
