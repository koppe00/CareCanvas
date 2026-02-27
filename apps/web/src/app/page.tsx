import Link from 'next/link';

const rollen = [
  { naam: 'De Dromer', kleur: 'bg-purple-100 text-purple-800', beschrijving: 'Deel uw zorgvisie in gewone taal, zonder technische kennis.' },
  { naam: 'De Gids', kleur: 'bg-blue-100 text-blue-800', beschrijving: 'Vertaal medische expertise naar ontwerppkaders.' },
  { naam: 'De Architect', kleur: 'bg-green-100 text-green-800', beschrijving: 'Stel gestructureerde specificaties op.' },
  { naam: 'De Bouwer', kleur: 'bg-orange-100 text-orange-800', beschrijving: 'Implementeer op basis van complete blauwdrukken.' },
  { naam: 'De Validator', kleur: 'bg-red-100 text-red-800', beschrijving: 'Beoordeel en stempel af vanuit uw expertise.' },
  { naam: 'De Beheerder', kleur: 'bg-gray-100 text-gray-800', beschrijving: 'Bewaakt kwaliteit en platformstandaarden.' },
];

const principes = [
  { nummer: 'I', naam: 'Menselijke Maat', beschrijving: 'Technologie dient altijd de zorgverlener en patiënt, niet andersom.' },
  { nummer: 'II', naam: 'Interoperabiliteit by Design', beschrijving: 'FHIR R4/R5 en ZIB\'s zijn geen optie, maar een basisvereiste.' },
  { nummer: 'III', naam: 'Radicale Transparantie', beschrijving: 'Geen black-box beslissingen. Elke AI-redenering is inzichtelijk.' },
  { nummer: 'IV', naam: 'Inclusieve Eigenaarschap', beschrijving: 'Patiënten zijn medeontwerpende stemmen, geen testsubjecten.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-teal-300 font-semibold text-sm uppercase tracking-wider mb-4">
              CareCanvas
            </p>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Van Verbeelding<br />naar Zorgkracht
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Een inclusief co-creatieplatform waar iedere zorgrol — van dromer tot bouwer —
              samen het zorgsysteem van morgen ontwerpt.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/auth/register"
                className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Begin vandaag
              </Link>
              <Link
                href="/auth/login"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg border border-white/30 transition-colors"
              >
                Inloggen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Citaat */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <blockquote className="text-2xl font-light text-blue-900 italic">
            "Techniek is de executable, verbeelding is de source code."
          </blockquote>
          <p className="text-blue-600 mt-3 text-sm">— CareCanvas Design Filosofie</p>
        </div>
      </section>

      {/* Rollen */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Elke rol telt
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            CareCanvas heeft geen hiërarchie van 'belangrijke' en 'minder belangrijke' gebruikers.
            Elke rol draagt een unieke en essentiële bijdrage aan het ecosysteem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rollen.map((rol) => (
              <div key={rol.naam} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${rol.kleur}`}>
                  {rol.naam}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{rol.beschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grondwet */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            De Grondwet
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Vier ononderhandelbare principes waaraan elk project wordt getoetst.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principes.map((p) => (
              <div key={p.nummer} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-blue-200 font-serif">{p.nummer}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{p.naam}</h3>
                    <p className="text-gray-500 text-sm">{p.beschrijving}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Functies */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Van idee naar blauwdruk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { stap: '1', naam: 'Sparring-Partner', omschrijving: 'AI-gesprekspartner die uw zorgvisie scherpt via socratische vragen.' },
              { stap: '2', naam: 'Spec-Generator', omschrijving: 'Automatische User Stories, datamodellen en FHIR API-contracten.' },
              { stap: '3', naam: 'Compliance-Scanner', omschrijving: 'Toetsing aan AVG, NEN 7510 en WGBO vóór u bouwt.' },
              { stap: '4', naam: 'Blueprint-Export', omschrijving: 'Complete exportpakketten die direct implementeerbaar zijn.' },
            ].map((f) => (
              <div key={f.stap} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {f.stap}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.naam}</h3>
                <p className="text-gray-500 text-sm">{f.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Laten we het zorgsysteem van morgen bouwen
          </h2>
          <p className="text-blue-200 mb-8">
            Maak vandaag een gratis account aan en begin uw eerste CareCanvas project.
          </p>
          <Link
            href="/auth/register"
            className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-10 py-4 rounded-lg text-lg transition-colors"
          >
            Gratis registreren
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm">© 2025 CareCanvas — Van Verbeelding naar Zorgkracht</p>
          <p className="text-xs">FHIR R4/R5 · ZIB 2020 · AVG-conform · NEN 7510</p>
        </div>
      </footer>
    </main>
  );
}
