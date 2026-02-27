PRODUCT REQUIREMENTS DOCUMENT
CareCanvas
Van Verbeelding naar Zorgkracht
Een inclusief co-creatieplatform waar iedere zorgrol — van dromer tot bouwer — samen het zorgsysteem van morgen ontwerpt.
Versie
1.0 — Initieel Productontwerp
Status
Concept ter review
Doelgroep
Zorgprofessionals, patiënten, beleidsmakers, IT-specialisten
De toekomst van de zorg wordt niet geschreven in code, maar gedroomd in visie en gevormd door samenwerking.



1. Executive Summary
De Nederlandse zorgsector beschikt over een buitengewone denkkracht: artsen, verpleegkundigen, patiënten, beleidsmakers en IT-professionals zien dagelijks wat er beter kan. Toch strandt het merendeel van die inzichten vóór ze ooit een systeem bereiken — vastgelopen in technische drempels, bureaucratie of simpelweg een gebrek aan een gedeelde ruimte om samen te ontwerpen.
CareCanvas is het antwoord op dat probleem. Het is een inclusief, AI-ondersteund co-creatieplatform dat de brug slaat tussen menselijke verbeelding en werkende zorgoplossingen. Elke rol binnen het zorgecosysteem — van bedlegerige patiënt tot architect op enterprise-niveau — krijgt een stem, een werkruimte en een pad naar realisatie.

“
Techniek is de executable, verbeelding is de source code.
— CareCanvas Design Filosofie


Dit document beschrijft de productvisie, gebruikersrollen, kernfunctionaliteiten, technische architectuur, governance-principes en implementatiefasering van CareCanvas versie 1.0.

2. Probleemstelling & Marktcontext
2.1 Het Innovatiegat in de Zorg
Zorginnovatie faalt zelden door een gebrek aan goede ideeën. Ze faalt door een gebroken keten tussen het idee en de implementatie. Onderzoek toont aan dat minder dan 5% van interne verbetervoorstellen binnen zorginstellingen ooit leidt tot een werkend prototype, laat staan een uitgerold systeem.

Barrière
Manifestatie in de praktijk
Technische drempel
Ideehouders missen codeervaardigheden; IT-teams ontbreken zorgdomeinkennis
Versnippering
Tientallen instellingen bouwen dezelfde module onafhankelijk van elkaar
Compliance-angst
AVG en NEN-normen worden als rem ervaren in plaats van als kader
Rolscheiding
Patiënten en naasten worden niet systematisch betrokken bij ontwerp
Gebrek aan standaarden
Nieuwe tools integreren niet met bestaande EPD-systemen (FHIR/ZIB)


2.2 De Kans
De opkomst van grote taalmodellen (LLMs) heeft de technische drempel fundamenteel verlaagd. Iemand die helder kan beschrijven wat hij nodig heeft, kan nu — met de juiste begeleiding — een functionele blauwdruk genereren zonder één regel code te schrijven. CareCanvas benut dit moment door de rol van techniek te verschuiven van poortwachter naar versterker.

3. Productvisie & Missie
3.1 Visie
“
Een zorgsector waarin elk idee voor betere zorg — ongeacht de technische achtergrond van de bedenker — de kans krijgt om werkelijkheid te worden, getoetst aan gedeelde waarden en versterkt door samenwerking.


3.2 Missie
CareCanvas biedt een werkplaats waar verbeelding een vorm krijgt. Het platform vertaalt ruwe zorgvisies naar gestructureerde blauwdrukken, toetst ze automatisch aan privacy- en veiligheidsstandaarden, verbindt de juiste mensen met de juiste ideeën, en levert exporteerbare specificaties die direct implementeerbaar zijn.

3.3 Grondwet: De Vier Ononderhandelbare Principes
Elk project dat via CareCanvas tot stand komt, wordt getoetst aan vier fundamentele waarden:

Principe I — Menselijke Maat
Technologie dient altijd de zorgverlener en patiënt, niet andersom. Een oplossing die
werklastverhogend is voor de zorgverlener of dehumaniserend voor de patiënt, voldoet
niet aan dit principe, ongeacht de technische elegantie.


Principe II — Interoperabiliteit by Design
Alles wat gebouwd wordt, communiceert met bestaande systemen. Implementatie van
zorginformatiestandaarden (ZIB’s) en FHIR R4/R5 API-contracten is geen optionele
toevoeging, maar een basisvereiste voor alle modules.


Principe III — Radicale Transparantie
Alle ontwerpen, beslissingslogica en AI-redenering zijn inzichtelijk voor de community.
Geen black-box beslissingen. Elk automatisch advies van het systeem bevat een
verklaring die begrijpelijk is voor niet-technische gebruikers.


Principe IV — Inclusieve Eigenaarschap
Patiënten en naasten zijn geen testsubjecten maar medeontwerpende stemmen. Elk
project vereist minimaal één gevalideerde patiëntperspectief vóór het de Architect-fase
instroomt.


4. Gebruikersrollen & Persona’s
CareCanvas onderscheidt zich door een fundamenteel inclusieve rolstructuur. Er is geen hiërarchie van “belangrijke” en “minder belangrijke” gebruikers. Elke rol draagt een unieke en essentiële bijdrage aan het ecosysteem.

4.1 De Dromer
Wie: Zorgprofessional, patiënt, mantelzorger of beleidsmaker met een visie op betere zorg.
Kernbehoefte: Een veilige, laagdrempelige ruimte om een idee te delen zonder technische kennis te hoeven hebben.
Bijdrage: De oorspronkelijke probleemformulering en het menselijk perspectief dat de richting bepaalt.
Frustratie zonder platform: Ideeën worden niet gehoord of stranden bij de eerste technische vraag.

4.2 De Gids
Wie: Ervaren zorgprofessional of domeinexpert (arts, verpleegkundig specialist, ethicus).
Kernbehoefte: Gereedschap om inhoudelijke kennis te vertalen naar ontwerpkaders.
Bijdrage: Medische validatie, ethische toetsing, en domeinspecifieke richtlijnen voor een module.
Frustratie zonder platform: Expertise blijft opgesloten in afdelingen; geen structureel kanaal naar innovatie.

4.3 De Architect
Wie: Informatiespecialist, data-analist, UX-ontwerper of product owner met technisch inzicht.
Kernbehoefte: Duidelijke input van Dromers en Gidsen om te vertalen naar werkbare specificaties.
Bijdrage: Procesdiagrammen, datamodellen, API-ontwerpen en technische documentatie.
Frustratie zonder platform: Technische discussies beginnen te vroeg, vóór de probleemruimte goed begrepen is.

4.4 De Bouwer
Wie: Softwareontwikkelaar, DevOps-engineer, leverancier of AI-coding-agent.
Kernbehoefte: Complete, gestandaardiseerde blauwdrukken die direct implementeerbaar zijn.
Bijdrage: Werkende code, integraties en deploybare modules.
Frustratie zonder platform: Onduidelijke specificaties leiden tot herwerk; gebouwde oplossingen sluiten niet aan bij de oorspronkelijke behoefte.

4.5 De Validator
Wie: Patiëntvertegenwoordiger, privacy-officer, compliance-specialist, klinisch onderzoeker.
Kernbehoefte: Gestructureerde mogelijkheid om ontwerpen te beoordelen vanuit hun specifieke verantwoordelijkheid.
Bijdrage: Formele goedkeuringen (stempels) op deelcomponenten van een module.
Frustratie zonder platform: Betrokkenheid komt te laat in het proces, waardoor fundamentele problemen kostbaar zijn om te corrigeren.

4.6 De Beheerder
Wie: Platformadministrator, kwaliteitsmanager of instellingsvertegenwoordiger.
Kernbehoefte: Overzicht, moderatie en borging van de platformstandaarden.
Bijdrage: Bewaking van de Grondwet, rolbeheer, moderatie van de community-bibliotheek.

5. Kernfunctionaliteiten
Het platform is functioneel opgebouwd in vier lagen die samen de levenscyclus van een idee ondersteunen: van rauwe verbeelding tot exporteerbare blauwdruk.

5.1 Laag I — De Verbeelding (Input Layer)
5.1.1 De Sparring-Partner
Een conversationele AI-interface waar gebruikers hun zorgvisie kunnen delen in natuurlijke taal, spraak of een combinatie van beide. De AI fungeert niet als een zoekmotor die antwoorden geeft, maar als een Socratische gesprekspartner die door gerichte vragen de probleemruimte scherpt.

Kerngedragingen van de Sparring-Partner AI:
Stelt verduidelijkingsvragen wanneer een visie te breed of te vaag is.
Detecteert veronderstellingen en bevraagt ze expliciet ('U gaat ervan uit dat verpleegkundigen altijd toegang hebben tot de tablet — klopt dat?').
Signaleert wanneer een beschreven probleem overeenkomt met een bestaand project in de bibliotheek.
Slaat de volledige conversatiegeschiedenis op als traceeerbare probleemformulering.

5.1.2 Het Canvas
Een vrije werkruimte voor visuele input: foto’s van post-its, whiteboard-schetsen, mindmaps, procesdiagrammen op papier of importeerbare Figma-bestanden. Optical Character Recognition (OCR) verwerkt handgeschreven tekst automatisch naar doorzoekbare digitale concepten.

5.2 Laag II — De Architect (Transformatie Layer)
Zodra een visie voldoende is aangescherpt door de Sparring-Partner, activeert het platform de structuurmodus. De AI transformeert de gespreksoutput naar formele artefacten.

5.2.1 Scenario-Mapper
Zet een beschreven gebruik in een stroomschema: wie doet wat, wanneer, op welk apparaat, en wat zijn de uitzonderingsscenario’s? De mapper genereert automatisch Happy Path, Sad Path en Edge Cases.

5.2.2 De Spec-Generator
Genereert automatisch gestructureerde technische documentatie:
User Stories in gestandaardiseerd formaat: Als [rol] wil ik [actie] zodat [resultaat].
Data-entiteiten: Welke informatie wordt opgeslagen, verwerkt of uitgewisseld?
ZIB-mapping: Automatische koppeling van data-elementen aan relevante Zorginformatiebouwstenen.
API-contracten: OpenAPI 3.0 specificaties voor interoperabiliteit met EPD-systemen.
Acceptatiecriteria: Testbare voorwaarden per User Story.

5.3 Laag III — De Filter (Governance Layer)
Dit is de bewaker van het ecosysteem. De Filter voorkomt wildgroei en borgt compliance vóór er een bouwer aan het werk gaat.

5.3.1 Consistentie-Check
Bij het indienen van een nieuw project scant de AI de volledige bibliotheek op functionele overlap. De gebruiker ontvangt een rapport: 'Er bestaan al 3 modules rondom medicatiebeheer. Hier is een analyse van de overlap met uw concept. Wilt u bestaande modules verbeteren, samenvoegen, of is uw use-case aantoonbaar uniek?'

5.3.2 Compliance-Scanner
Automatische toetsing van het ontwerp aan:
AVG / GDPR: Minimale dataverzameling, doelbinding, bewaartermijnen.
NEN 7510/7513: Informatiebeveiliging in de zorg.
WGBO: Rechten van patiënten in het digitale domein.
MDR (Medical Device Regulation): Classificatie als medisch hulpmiddel indien van toepassing.

De scanner genereert een kleurgecodeerd rapport (groen/oranje/rood) met specifieke aanbevelingen per bevinding. Rode bevindingen blokkeren doorstroom naar de Bouwer-fase tot ze zijn opgelost en gevalideerd door een Validator.

5.4 Laag IV — De Community (Sociale Layer)
5.4.1 Rol-Matching
Het platform koppelt actief gebruikers op basis van complementaire rollen en gedeelde zorgdomeinen. Een Dromer met een oncologie-idee wordt gekoppeld aan beschikbare Gidsen met oncologie-expertise en Architecten met EPD-integratie-ervaring. Matching is transparant: gebruikers zien waarom ze worden voorgesteld.

5.4.2 Validatie-Stempels
Experts kunnen specifieke onderdelen van een module formeel accorderen. Stempels zijn rol-specifiek en traceerbaar:

Stempeltype
Afgegeven door
Betekenis
Medisch veilig
BIG-geregistreerde zorgverlener
Klinische risico’s zijn beoordeeld
Privacy-conform
Functionaris Gegevensbescherming
AVG-toetsing positief doorlopen
Patiënt-gevalideerd
Patiëntvertegenwoordiger
Ervaringsperspectief verwerkt
Technisch haalbaar
Senior Architect of Lead Developer
Implementeerbaarheid bevestigd
FHIR-compliant
HL7 Nederland gecertificeerde specialist
Interoperabiliteit gewaarborgd


5.4.3 Open-Source Bibliotheek
Een gedeelde repository van ‘Lego-blokjes’: herbruikbare ontwerpen, datamodellen, User Story-sets, UI-patronen en code-snippets. Elk blokje draagt de stempels die het heeft verdiend en is forkbaar. Gebruikers die een blokje aanpassen, dienen de aanpassingen terug bij te dragen aan de bibliotheek (copyleft-model) of het fork als nieuw project te registreren.

6. Gebruikerservaringen & Kernstromen
6.1 De Ideestroom: Van Gedachte naar Blauwdruk
Onderstaande stroom beschrijft de primaire workflow van een Dromer die een nieuw idee indient:

Ingang — De Dromer deelt via spraak of tekst een zorgvisie in de Sparring-Partner interface.
Verdieping — De AI stelt socratische vragen totdat een probleemformulering van voldoende diepgang is bereikt (minimaal 3 vragen beantwoord).
Canvas-aanvulling — De Dromer voegt optioneel schetsmateriaal toe via het Canvas; OCR verwerkt het automatisch.
Consistentie-scan — Het systeem controleert de bibliotheek op overlap en rapporteert.
Rol-Matching — Op basis van het zorgdomein en de projectfase worden relevante Gidsen, Architecten en Validators voorgesteld.
Scenario-Mapping — De Architect-laag genereert een eerste stroomschema ter validatie door de Dromer.
Spec-Generatie — Na goedkeuring van het stroomschema worden User Stories, data-entiteiten en API-contracten gegenereerd.
Compliance-Scan — Automatische toetsing; oranje bevindingen worden besproken, rode geblokkeerd.
Community-Review — Gidsen en Validators accorderen relevante onderdelen met stempels.
Export — Een complete Blueprint-package wordt gegenereerd: geschikt voor directe import in Claude Code of overdracht aan een externe ontwikkelaar.

6.2 De Bibliotheekstroom: Van Blokje naar Oplossing
Een Bouwer of Architect zoekt een bestaand blokje op in de bibliotheek, forkt het voor de eigen context, past het aan en dient de aanpassingen terug in als verbeterd blokje. De community valideert en het blokje krijgt een hogere versie-indicatie.

7. Technische Architectuur
7.1 Architectuurprincipes
API-first: Alle platformfunctionaliteit is beschikbaar via een gedocumenteerde REST/GraphQL API.
Privacy by Design: Persoonsgegevens worden gepseudonimiseerd op ingest; re-identificatie vereist expliciete toestemming.
Cloud-agnostisch: De kern is containerized (Docker/Kubernetes) en deploybaar op elke grote cloud-provider of on-premise.
Open Standaarden: FHIR R4/R5, HL7, SNOMED-CT, LOINC als fundamenten voor data-uitwisseling.

7.2 Componentenlandschap

Component
Technologie (richtlijn)
Functie
Front-end Studio
React / Next.js
Collaboratieve web-IDE vergelijkbaar met Figma + Notion
AI-Orchestratie
Claude API (Anthropic)
Sparring-Partner, Spec-Generator, Compliance-Scanner
Grafendatabase
Neo4j of Amazon Neptune
Relaties tussen ideeën, rollen, modules en stempels
Documentopslag
S3-compatibele objectstore
Canvas-items, OCR-output, Blueprint-packages
Zoekindex
Elasticsearch / OpenSearch
Bibliotheek-zoekfunctie en consistentie-scan
Auth & IAM
OAuth 2.0 / OpenID Connect
Rolbeheer, BIG-registratie verificatie, SSO
FHIR Server
HAPI FHIR of Azure FHIR
Interoperabiliteitslaag naar EPD-systemen
Audit Log
Immutable event-stream (Kafka)
Traceerbaarheid van alle beslissingen en wijzigingen


7.3 Datamodel (Conceptueel)
De kern van het datamodel bestaat uit vijf primaire entiteiten die via de grafendatabase aan elkaar zijn gerelateerd:
Project: De overkoepelende container voor een zorgidee met metadata, status en versiehistorie.
Artefact: Een specifiek document binnen een project (User Story, datamodel, stroomschema, Blueprint).
Gebruiker: Een individu met een of meer rollen, verificatiestatus en domeinprofiel.
Stempel: Een formele validatie-actie gekoppeld aan een Artefact, een Gebruiker en een tijdstip.
Blokje: Een herbruikbaar component uit de bibliotheek met versie, afkomst en afgeleid gebruik.

7.4 Integratiestandaarden
CareCanvas ondersteunt en vereist de volgende integratiestandaarden voor alle export-pakketten:
FHIR R4/R5: Basis voor alle data-uitwisseling met klinische systemen.
ZIB 2020: Zorginformatiebouwstenen als canoniek datamodel voor Nederlandse context.
OpenAPI 3.0: Specificatiestandaard voor alle gegenereerde API-contracten.
BPMN 2.0: Standaard voor export van procesdiagrammen.
HL7 CDA: Voor documentuitwisseling met oudere EPD-systemen.

8. Platform Governance
8.1 Besluitvormingsstructuur
CareCanvas hanteert een meritocratisch governance-model gebaseerd op bijdrage en expertise, niet op hiërarchie of instelling. Drie organen bewaken het platform:

Kernteam
Verantwoordelijk voor de Grondwet, technische roadmap en partnerrelaties.
Samenstelling: 2 zorgprofessionals, 2 technologen, 1 patiëntvertegenwoordiger,
1 ethicus, 1 privacy-jurist. Roterend lidmaatschap per 2 jaar.


Community Council
Verkozen vertegenwoordiging van actieve platformgebruikers. Adviseert het Kernteam
over feature-prioritering en beleid. Minimaal 30% patiënt- of mantelzorger-vertegenwoordiging.


Ethische Raad
Onafhankelijk orgaan dat gevallen beoordeelt waarbij de Compliance-Scanner of de
community een ethisch grensgebied signaleert. Bindend advies bij escalaties.


8.2 Contentmoderatie
De bibliotheek wordt bewaakt door een combinatie van automatische scanning (AI) en community-moderatie. Blokjes die niet aan de Grondwet voldoen, worden gemarkeerd en besproken voor archivering. Gebruikers die structureel bijdragen aan de kwaliteit van de bibliotheek, ontvangen een hogere vertrouwensscore die aanvullende moderatierechten ontsluit.

9. Implementatiefasering

Fase
Tijdlijn
Deliverables
0 — Fundament
Maand 1–3
Kerninfrastructuur, authenticatie, basisdatabase, rolmodel, minimale Studio UI
1 — Alfa
Maand 4–6
Sparring-Partner MVP, Canvas met OCR, eerste Scenario-Mapper, gesloten gebruikersgroep (50 gebruikers)
2 — Beta
Maand 7–12
Spec-Generator, Compliance-Scanner, Rol-Matching, Validatie-Stempels, uitbreiding naar 500 gebruikers
3 — Community
Maand 13–18
Open-Source Bibliotheek, forking-mechanisme, Community Council, publieke toegang
4 — Ecosysteem
Maand 19–24
FHIR-server integraties, EPD-koppelingen, Blueprint-export voor Claude Code, API voor derden


9.1 Succescriteria per Fase
Fase 1 (Alfa): Minimaal 80% van gebruikers bereikt een gestructureerde probleemformulering na de Sparring-Partner sessie, zonder technische ondersteuning.
Fase 2 (Beta): Compliance-Scanner identificeert en rapporteert AVG-risico’s met een precisie van >90% vergeleken met handmatige expert-beoordeling.
Fase 3 (Community): Minimaal 30% van projecten maakt gebruik van een bestaand bibliotheekblokje. Gemiddelde projectdoorlooptijd is <40% van een traditioneel IT-project.
Fase 4 (Ecosysteem): Minimaal vijf zorginstellingen deployen een module die via CareCanvas is ontworpen en via een EPD-koppeling gevalideerd.

10. Risico’s & Mitigatie

Risico
Impact
Mitigatie
AI genereert onjuiste medische specificaties
Hoog
Alle AI-output wordt gemarkeerd als concept; validatie door Gids en Validator is verplicht vóór export
Te lage adoptie door niet-technische gebruikers
Hoog
Co-design traject met eindgebruikers vóór bouw; uitgebreid onboarding-programma; buddy-systeem Dromer-Architect
Wildgroei van niet-conforme blokjes in bibliotheek
Middel
Automatische compliance-scan bij indiening; community-moderatie; stempel-vereiste voor publicatie
Vendor lock-in op AI-provider
Middel
API-abstractielaag zodat provider-wissel mogelijk is; regelmatige evaluatie van alternatieven
Privacy-incident door onjuiste data-invoer
Hoog
Pseudonimisering op ingest; expliciete waarschuwing bij invoer van patiëntidentificeerbare data; audit-logging
Onduidelijke juridische status gegenereerde specificaties
Middel
Expliciete disclaimer; uitwerking aansprakelijkheidsmodel met juridisch adviseur in Fase 0


11. Openstaande Vragen & Beslispunten
De volgende vraagstukken vereisen een beslissing vóór de start van Fase 0:

Financieringsmodel
Kiest CareCanvas voor een publiek gefinancierd model (via VWS, ZonMw of een koepelorganisatie), een coöperatief model (gezamenlijk eigendom van deelnemende zorginstellingen), of een commercieel freemium-model? Elk model heeft directe implicaties voor governance, datasoevereiniteit en toegankelijkheid.

Juridisch eigenaarschap gegenereerde specificaties
Wie is juridisch eigenaar van een Blueprint die is gegenereerd door AI op basis van input van een Dromer, aangevuld door een Architect en gevalideerd door een Validator? Een co-auteurschapmodel of een commons-licentie (Creative Commons BY-SA) verdient uitwerking.

BIG-verificatie
Hoe verificeert het platform de BIG-registratie van Gidsen en Validators zonder een centrale identiteitsinfrastructuur te vereisen? DigiD-koppeling of federatieve verificatie via instelling zijn opties.

Scope van de Compliance-Scanner
Hanteert de scanner een statisch regelset (onderhouden door het Kernteam) of een dynamisch model dat bijleert van nieuwe wet- en regelgeving? Het laatste vereist significant meer onderhoud maar biedt hogere betrouwbaarheid op termijn.

12. Conclusie — Een Uitnodiging
Dit document is geen eindpunt maar een beginpunt. CareCanvas is bij uitstek een platform dat zichzelf niet kan ontwerpen zonder de stem van degenen die het zullen gebruiken. De ironie is opzettelijk en wezenlijk: dit PRD is de eerste Dromer-sessie van het platform zelf.

We nodigen iedereen die dit leest uit om niet alleen te reageren op wat hier staat, maar om te beschrijven wat er ontbreekt vanuit uw perspectief. De beste validatie van dit concept is niet een goedkeurend advies, maar een concreet verhaal: een moment waarop u dacht 'als we toen een tool als dit hadden gehad…'

“
Laten we ophouden met ons aanpassen aan de systemen, en beginnen met het ontwerpen van systemen die zich aanpassen aan ons.
— CareCanvas Manifest


Het platform dat we beschrijven is het platform dat we nodig hadden om het te ontwerpen. Laten we het bouwen.

Appendix A — Glossarium

Term
Definitie
Blueprint
Het volledige exportpakket van een CareCanvas-project: User Stories, datamodellen, API-contracten en procesdiagrammen.
Blokje
Een herbruikbaar, gevalideerd component uit de Open-Source Bibliotheek.
FHIR
Fast Healthcare Interoperability Resources: internationale standaard voor uitwisseling van zorginformatie.
Grondwet
De vier ononderhandelbare principes waaraan elk CareCanvas-project wordt getoetst.
LLM
Large Language Model: een AI-taalmodel zoals Claude, gebruikt als kern van de Sparring-Partner.
Stempel
Een formele validatie-actie van een gekwalificeerde gebruiker op een projectonderdeel.
ZIB
Zorginformatiebouwsteen: Nederlandse standaard voor klinische dataconcepeten, beheerd door Nictiz.


Appendix B — Referentiestandaarden
HL7 FHIR R4/R5 — hl7.org/fhir
Nictiz ZIB 2020 — zibs.nl
NEN 7510:2017+A1:2020 — Informatiebeveiliging in de zorg
NEN 7513:2018 — Logging van toegang tot patiëntgegevens
AVG / GDPR — Verordening (EU) 2016/679
EU Medical Device Regulation (MDR) 2017/745
OpenAPI Specification 3.0 — spec.openapis.org
BPMN 2.0 — omg.org/bpmn
