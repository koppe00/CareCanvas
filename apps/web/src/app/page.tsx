import Link from 'next/link';

const rollen = [
  { naam: 'De Dromer', kleur: 'bg-purple-100 text-purple-800', beschrijving: 'Deel uw zorgvisie in gewone taal, zonder technische kennis.' },
  { naam: 'De Gids', kleur: 'bg-blue-100 text-blue-800', beschrijving: 'Vertaal medische expertise naar ontwerppkaders.' },
  { naam: 'De Architect', kleur: 'bg-green-100 text-green-800', beschrijving: 'Stel gestructureerde specificaties op.' },
  { naam: 'De Bouwer', kleur: 'bg-orange-100 text-orange-800', beschrijving: 'Implementeer op basis van complete blauwdrukken.' },
  { naam: 'De Validator', kleur: 'bg-red-100 text-red-800', beschrijving: 'Beoordeel en stempel af vanuit uw expertise.' },
  { naam: 'De Beheerder', kleur: 'bg-gray-100 text-gray-800', beschrijving: 'Bewaakt kwaliteit en platformstandaarden.' },
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

      {/* Elementen-keten */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Van visie tot datamodel
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            CareCanvas werkt met tien samenhangende element-typen. Elk element bouwt voort op het vorige —
            van een hoog-over Visie tot een concreet Datamodel dat direct implementeerbaar is.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 mb-16">
            {[
              { label: 'Visie', kleur: 'bg-purple-100 text-purple-700' },
              { label: '→', kleur: '' },
              { label: 'Principe', kleur: 'bg-indigo-100 text-indigo-700' },
              { label: '→', kleur: '' },
              { label: 'Epic', kleur: 'bg-blue-100 text-blue-700' },
              { label: '→', kleur: '' },
              { label: 'Module', kleur: 'bg-cyan-100 text-cyan-700' },
              { label: '→', kleur: '' },
              { label: 'Functionaliteit', kleur: 'bg-teal-100 text-teal-700' },
              { label: '→', kleur: '' },
              { label: 'Ontwerp', kleur: 'bg-green-100 text-green-700' },
              { label: '→', kleur: '' },
              { label: 'User Story', kleur: 'bg-yellow-100 text-yellow-700' },
              { label: '→', kleur: '' },
              { label: 'API Contract', kleur: 'bg-orange-100 text-orange-700' },
              { label: '→', kleur: '' },
              { label: 'Datamodel', kleur: 'bg-red-100 text-red-700' },
            ].map((item, i) =>
              item.kleur ? (
                <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${item.kleur}`}>
                  {item.label}
                </span>
              ) : (
                <span key={i} className="text-gray-300 font-light">{item.label}</span>
              )
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Hoe het werkt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                stap: '1',
                naam: 'Sparring-Partner',
                omschrijving: 'Verken uw idee via een socratisch AI-gesprek. De Sparring-Partner stelt gerichte vragen totdat uw concept helder genoeg is om op te slaan als element.',
              },
              {
                stap: '2',
                naam: 'Elementen aanmaken',
                omschrijving: 'Sla uw ideeën op als getypeerde elementen — van abstracte Visie tot concrete User Story. Elk element doorloopt een eigen workflow van Concept naar Vastgesteld.',
              },
              {
                stap: '3',
                naam: 'AI-gestuurde afleiding',
                omschrijving: 'Klik "Afleiden naar →" op elk element. De AI analyseert de inhoud en beveelt aan welk volgend element het meest zinvol is om nu aan te maken — inclusief een concept-draft.',
              },
              {
                stap: '4',
                naam: 'Systeem Canvas',
                omschrijving: 'Alle goedgekeurde elementen zijn hiërarchisch verbonden. Het Canvas toont de volledige blauwdruk als een klikbare boom — van Visie helemaal door naar Datamodel.',
              },
            ].map((f) => (
              <div key={f.stap} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {f.stap}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.naam}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rollen */}
      <section className="py-20 px-6 bg-gray-50">
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
              <div key={rol.naam} className="border border-gray-100 bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${rol.kleur}`}>
                  {rol.naam}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{rol.beschrijving}</p>
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
            Maak vandaag een gratis account aan en zet uw eerste element op het canvas.
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
          <p className="text-sm">© 2026 CareCanvas — Van Verbeelding naar Zorgkracht</p>
          <p className="text-xs">FHIR R4/R5 · ZIB 2020 · AVG-conform · NEN 7510</p>
        </div>
      </footer>
    </main>
  );
}
