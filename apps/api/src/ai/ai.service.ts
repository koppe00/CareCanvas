import { Injectable, Logger } from '@nestjs/common';

export interface SparringBerichtInput {
  gesprekGeschiedenis: { rol: string; inhoud: string }[];
  nieuweVraag: string;
  projectContext?: string;
}

export interface ElementVoorstel {
  titel: string;
  type: string;
  inhoud: string;
  toelichting: string;
}

export interface SparringAntwoord {
  inhoud: string;
  isProbleemFormuleringKlaar: boolean;
  probleemFormulering?: string;
  elementVoorstel?: ElementVoorstel;
  aiProvider?: string;  // 'claude', 'gemini (CareCanvasApi1)', 'mock'
  aiModel?: string;     // 'claude-sonnet-4-6', 'gemini-2.5-pro', 'demo-modus'
}

interface LLMResultaat {
  tekst: string;
  provider: string;
  model: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  private readonly anthropicModel = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
  private readonly anthropicBeschikbaar =
    !!this.anthropicApiKey && this.anthropicApiKey !== 'sk-ant-PLACEHOLDER';

  // Gemini fallback-providers (in volgorde van prioriteit)
  private readonly geminiProviders: { naam: string; sleutel: string }[] = [
    { naam: 'CareCanvasApi1', sleutel: process.env.GEMINI_API_KEY_1 ?? '' },
    { naam: 'CareCanvasApi2', sleutel: process.env.GEMINI_API_KEY_2 ?? '' },
  ].filter((g) => !!g.sleutel);

  // Gemini modellen in volgorde van voorkeur (beste kwaliteit eerst)
  private readonly geminiModellen = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  async sparringPartner(input: SparringBerichtInput): Promise<SparringAntwoord> {
    return this.sparringMetFallback(input);
  }

  async extraheerElementenUitDocument(document: string): Promise<ElementVoorstel[]> {
    return this.documentNaarElementenMetFallback(document);
  }

  async genereerSpecificaties(probleemFormulering: string, context: string) {
    return this.genereerSpecificatiesMetFallback(probleemFormulering, context);
  }

  async scanCompliance(projectBeschrijving: string) {
    return this.scanComplianceMetFallback(projectBeschrijving);
  }

  async checkConsistentie(nieuw: string, bestaande: string[]) {
    return this.mockConsistentieCheck(nieuw, bestaande);
  }

  async classificeerElement(tekst: string): Promise<{ type: string; toelichting: string; vertrouwen: number }> {
    return this.classificeerElementMetFallback(tekst);
  }

  async afleidElementen(
    bronElement: any,
    doelType: string,
    bestaandeElementen: any[],
  ): Promise<{ drafts: ElementVoorstel[]; kandidaten: { elementId: string; score: number; reden: string }[] }> {
    const formatInstructies: Record<string, string> = {
      VISIE: 'Wij geloven dat... [ambitie]. Onze visie is...',
      PRINCIPE: 'Principe: [stelling]. Rationale: [waarom]. Implicaties: [praktijk].',
      EPIC: 'Als [doelgroep] willen wij [capability] zodat [businesswaarde].',
      MODULE: 'Module [naam]: [verantwoordelijkheid en afbakening].',
      FUNCTIONALITEIT: 'Functionaliteit [naam]: [wat het doet, voor wie, waarom].',
      FUNCTIONEEL_ONTWERP: 'Functioneel ontwerp: [beschrijving van gedrag, schermen, flows].',
      TECHNISCH_ONTWERP: 'Technisch ontwerp: [architectuur, patronen, technologiekeuzes].',
      USER_STORY: 'Als [rol] wil ik [actie] zodat [doel].\n\nAcceptatiecriteria:\n- [...]\n- [...]',
      API_CONTRACT: 'Endpoint: [METHODE] /pad\nRequest body: {...}\nResponse 200: {...}',
      DATAMODEL: 'Entiteit: [naam]\nVelden:\n- [naam] ([type]): [beschrijving]',
    };
    const format = formatInstructies[doelType] ?? 'Beschrijf het element zo concreet mogelijk.';
    const kandidatenLijst = bestaandeElementen
      .slice(0, 20)
      .map((e: any) => `- ID: ${e.id} | Titel: ${e.titel}`)
      .join('\n');

    const systeemPrompt = `Je bent expert in zorginnovatie en softwareontwikkeling. Je helpt CareCanvas-gebruikers elementen
af te leiden van bestaande elementen. Geef altijd valide JSON zonder markdown-blokken.`;

    const gebruikerPrompt = `Bron-element:
Type: ${bronElement.type}
Titel: ${bronElement.titel}
Inhoud: ${bronElement.inhoud ?? ''}
Toelichting: ${bronElement.toelichting ?? ''}

Taak: Genereer 2-3 conceptuele ${doelType}-elementen die logisch voortvloeien uit dit bron-element.
Gebruik dit format voor ${doelType}: "${format}"

${kandidatenLijst ? `Bestaande ${doelType}-kandidaten (beoordeel relevantie 0-100):\n${kandidatenLijst}\n` : ''}
Geef ALLEEN dit JSON-object terug:
{
  "drafts": [
    { "titel": "...", "inhoud": "...", "toelichting": "..." }
  ],
  "kandidaten": [
    { "elementId": "...", "score": 75, "reden": "..." }
  ]
}`;

    try {
      const resultaat = await this.llmAnroep(systeemPrompt, gebruikerPrompt);
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(json);
      return {
        drafts: (parsed.drafts ?? []).map((d: any) => ({ ...d, type: doelType })),
        kandidaten: parsed.kandidaten ?? [],
      };
    } catch {
      return this.mockAfleidElementen(bronElement, doelType, bestaandeElementen);
    }
  }

  async vergelijkMetPrincipes(element: any, principes: any[]): Promise<{ consistent: boolean; signalen: string[] }> {
    try {
      const resultaat = await this.llmAnroep(
        `Je bent een CareCanvas consistentie-checker voor zorginnovatie-elementen.
Vergelijk elementen met vastgestelde principes en signaleer inconsistenties. Geef altijd valide JSON terug zonder markdown.`,
        `Vergelijk het volgende element met de vastgestelde principes:\n\nElement: ${JSON.stringify(element)}\nPrincipes: ${JSON.stringify(principes)}\n\nGeef ALLEEN een JSON-object terug:\n{ "consistent": true/false, "signalen": ["<signaal 1>"] }`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json);
    } catch {
      return { consistent: true, signalen: [] };
    }
  }

  // ─── Mock implementaties ──────────────────────────────────────────────────

  private mockSparringAntwoord(input: SparringBerichtInput): SparringAntwoord {
    const vraagCount = input.gesprekGeschiedenis.filter((b) => b.rol === 'ai').length;
    const vragen = [
      'Interessant idee! Kunt u mij meer vertellen over wie dit probleem dagelijks ervaart? Welke zorgverleners of patiënten worden het meest geraakt?',
      'U heeft de doelgroep helder omschreven. Wat is op dit moment de grootste knelpunt in het huidige proces? Wat gaat er mis en met welke frequentie?',
      'Dat geeft goed inzicht in de pijnpunten. Welke oplossing heeft u voor ogen? Beschrijf de ideale situatie zoals het zou moeten werken.',
      'Op basis van ons gesprek stel ik de volgende probleemformulering voor. Wilt u dat ik nu specificaties genereer?',
    ];

    const isKlaar = vraagCount >= 3;
    const alleInhoud = [...input.gesprekGeschiedenis.map((b) => b.inhoud), input.nieuweVraag].join(' ');
    const classificatie = this.mockClassificeerElement(alleInhoud);

    // Bouw progressief een element voorstel op naarmate het gesprek vordert
    const elementVoorstel: ElementVoorstel | undefined = vraagCount >= 1
      ? {
          titel: this.mockExtraheerTitel(alleInhoud, input.nieuweVraag),
          type: classificatie.type,
          inhoud: isKlaar
            ? `Probleem: ${input.nieuweVraag}\n\nDoelgroep: Zorgverleners en patiënten in de Nederlandse zorgsector\n\nGewenste uitkomst: Een digitale oplossing die het proces vereenvoudigt en de werkdruk vermindert.`
            : `${input.nieuweVraag}\n\n(Voer het gesprek voort om dit element verder uit te werken...)`,
          toelichting: classificatie.toelichting,
        }
      : undefined;

    return {
      inhoud: isKlaar
        ? `Op basis van ons gesprek heb ik de probleemformulering samengesteld en een eerste element opgesteld. U ziet het concept rechts in uw scherm — pas de titel en inhoud aan naar wens en klik op "Element aanmaken" om het op te slaan.`
        : (vragen[vraagCount] ?? vragen[vragen.length - 1]),
      isProbleemFormuleringKlaar: isKlaar,
      probleemFormulering: isKlaar ? `Probleemformulering gebaseerd op: ${input.nieuweVraag}` : undefined,
      elementVoorstel,
    };
  }

  private mockExtraheerTitel(alleInhoud: string, nieuweVraag: string): string {
    const woorden = nieuweVraag.split(/\s+/).slice(0, 8).join(' ');
    const titel = woorden.charAt(0).toUpperCase() + woorden.slice(1);
    return titel.length > 60 ? titel.substring(0, 60) + '...' : titel;
  }

  private mockDocumentNaarElementen(document: string): ElementVoorstel[] {
    const regels = document.split('\n').filter((r) => r.trim().length > 10);
    const secties = this.splitsSectiesUitDocument(regels);
    return secties.slice(0, 8).map((sectie, i) => {
      const classificatie = this.mockClassificeerElement(sectie);
      return {
        titel: this.mockExtraheerTitel(sectie, sectie.substring(0, 80)),
        type: classificatie.type,
        inhoud: sectie.substring(0, 800),
        toelichting: `Sectie ${i + 1} — ${classificatie.toelichting}`,
      };
    });
  }

  private splitsSectiesUitDocument(regels: string[]): string[] {
    const secties: string[] = [];
    let huidigeSectie: string[] = [];
    for (const regel of regels) {
      const isKopRegel = /^#{1,3}\s|^[A-Z][A-Z\s]{3,}$/.test(regel.trim());
      if (isKopRegel && huidigeSectie.length > 2) {
        secties.push(huidigeSectie.join('\n'));
        huidigeSectie = [regel];
      } else {
        huidigeSectie.push(regel);
      }
    }
    if (huidigeSectie.length > 0) secties.push(huidigeSectie.join('\n'));
    return secties.length > 1 ? secties : [regels.join('\n')];
  }

  private mockSpecificaties(probleemFormulering: string) {
    const kort = probleemFormulering.slice(0, 80);
    return {
      userStories: [
        {
          id: 'US-001',
          als: 'patiënt',
          wil: `de oplossing voor "${kort}" kunnen gebruiken`,
          zodat: 'ik meer regie heb over mijn eigen zorgproces',
          acceptatieCriteria: [
            'De functionaliteit is toegankelijk via een beveiligde login',
            'De patiënt kan zelfstandig gegevens inzien en beheren',
            'Wijzigingen worden gelogd conform NEN 7513',
          ],
          prioriteit: 'MUST',
          zibReferenties: ['ZIB-Patient', 'ZIB-Contactpersoon'],
        },
        {
          id: 'US-002',
          als: 'zorgverlener',
          wil: 'inzicht hebben in de voortgang van het zorgplan',
          zodat: 'ik tijdig kan bijsturen en de patiënt optimaal kan ondersteunen',
          acceptatieCriteria: [
            'Overzicht is beschikbaar binnen het EPD',
            'Statuswijzigingen zijn direct zichtbaar',
            'Notificaties bij afwijkingen zijn instelbaar',
          ],
          prioriteit: 'MUST',
          zibReferenties: ['ZIB-Zorgverlener', 'ZIB-ZorgTeam'],
        },
        {
          id: 'US-003',
          als: 'beheerder',
          wil: 'toegangsrechten per rol kunnen instellen',
          zodat: 'alleen geautoriseerde gebruikers toegang hebben tot gevoelige gegevens',
          acceptatieCriteria: [
            'Rolgebaseerde toegangsmatrix is configureerbaar',
            'Auditlog registreert alle toegangspogingen',
            'Toegang kan direct worden ingetrokken',
          ],
          prioriteit: 'MUST',
          zibReferenties: ['ZIB-MedewerkerIdentificatie'],
        },
      ],
      dataEntiteiten: [
        {
          naam: 'ZorgObject',
          beschrijving: `Kernentiteit voor: ${kort}`,
          velden: [
            { naam: 'id', type: 'UUID', verplicht: true, beschrijving: 'Uniek ID', fhirPath: 'Resource.id' },
            { naam: 'patientId', type: 'UUID', verplicht: true, beschrijving: 'Verwijzing naar patiënt', fhirPath: 'Resource.subject' },
            { naam: 'aangemaaktOp', type: 'DateTime', verplicht: true, beschrijving: 'Aanmaakdatum', fhirPath: 'Resource.meta.lastUpdated' },
            { naam: 'status', type: 'string', verplicht: true, beschrijving: 'Huidige status', fhirPath: 'Resource.status' },
          ],
          zibKoppeling: 'nl.zorg.Patient',
        },
        {
          naam: 'Toestemming',
          beschrijving: 'Vastlegging van patiënttoestemming conform AVG',
          velden: [
            { naam: 'id', type: 'UUID', verplicht: true, beschrijving: 'Uniek ID', fhirPath: 'Consent.id' },
            { naam: 'patientId', type: 'UUID', verplicht: true, beschrijving: 'Patiëntreferentie', fhirPath: 'Consent.patient' },
            { naam: 'doel', type: 'string', verplicht: true, beschrijving: 'Doel van verwerking', fhirPath: 'Consent.category' },
            { naam: 'geldigTot', type: 'Date', verplicht: false, beschrijving: 'Vervaldatum toestemming', fhirPath: 'Consent.provision.period.end' },
          ],
          zibKoppeling: 'nl.zorg.ToestemmingVertegenwoordiging',
        },
      ],
      apiContracten: [
        {
          endpoint: '/api/v1/zorgobject/{id}',
          methode: 'GET',
          beschrijving: 'Haal zorgobject op voor geautoriseerde gebruiker',
          fhirResource: 'Bundle',
          responses: { '200': { description: 'ZorgObject gevonden' }, '403': { description: 'Geen toegang' } },
        },
        {
          endpoint: '/api/v1/toestemming',
          methode: 'POST',
          beschrijving: 'Leg patiënttoestemming vast',
          fhirResource: 'Consent',
          responses: { '201': { description: 'Toestemming vastgelegd' } },
        },
      ],
      zibMappings: [
        { dataElement: 'patientId', zibNaam: 'Patient', zibVeld: 'Identificatienummer', fhirPath: 'Patient.identifier' },
        { dataElement: 'doel', zibNaam: 'ToestemmingVertegenwoordiging', zibVeld: 'Toestemmingstype', fhirPath: 'Consent.category.coding' },
      ],
    };
  }

  private mockComplianceScan(beschrijving: string) {
    const kort = beschrijving.slice(0, 80);
    return {
      algemeenOordeel: 'ORANJE',
      gescandOp: new Date(),
      bevindingen: [
        {
          id: 'BEVINDING-001',
          categorie: 'AVG',
          ernst: 'ORANJE',
          titel: 'Verwerkingsgrondslag vereist documentatie',
          beschrijving: `Voor het project "${kort}" dient de wettelijke grondslag voor gegevensverwerking expliciet gedocumenteerd te zijn.`,
          aanbeveling: 'Leg de verwerkingsgrondslag vast in een verwerkingsregister conform AVG Art. 30.',
          regelReferentie: 'AVG Art. 6 & 30',
          opgelost: false,
        },
        {
          id: 'BEVINDING-002',
          categorie: 'AVG',
          ernst: 'ORANJE',
          titel: 'Bewaartermijn niet gespecificeerd',
          beschrijving: 'Er is geen expliciete bewaartermijn gedefinieerd voor de verwerkte persoonsgegevens.',
          aanbeveling: 'Definieer een bewaartermijn conform WGBO (minimaal 20 jaar voor medische dossiers).',
          regelReferentie: 'AVG Art. 5(1)(e), WGBO Art. 7:454',
          opgelost: false,
        },
        {
          id: 'BEVINDING-003',
          categorie: 'NEN_7510',
          ernst: 'ORANJE',
          titel: 'Toegangscontrole vereist uitwerking',
          beschrijving: 'Het autorisatiemodel voor toegang tot patiëntgegevens is nog niet volledig uitgewerkt.',
          aanbeveling: 'Stel een RBAC-matrix op per gebruikersrol en documenteer dit in het beveiligingsbeleid.',
          regelReferentie: 'NEN 7510:2017 §9.1.1',
          opgelost: false,
        },
        {
          id: 'BEVINDING-004',
          categorie: 'WGBO',
          ernst: 'GROEN',
          titel: 'Patiëntrechten geborgd',
          beschrijving: 'Het project houdt rekening met inzage- en correctierecht van de patiënt.',
          aanbeveling: 'Implementeer een zelfserviceportaal voor inzage en correctieverzoeken conform WGBO Art. 7:456.',
          regelReferentie: 'WGBO Art. 7:456',
          opgelost: false,
        },
      ],
      geblokkeerd: false,
    };
  }

  private mockClassificeerElement(tekst: string): { type: string; toelichting: string; vertrouwen: number } {
    const tekst_lower = tekst.toLowerCase();
    if (tekst_lower.includes('visie') || tekst_lower.includes('toekomst') || tekst_lower.includes('ambitie')) {
      return { type: 'VISIE', toelichting: 'De tekst beschrijft een toekomstgerichte ambitie of visie.', vertrouwen: 0.75 };
    }
    if (tekst_lower.includes('principe') || tekst_lower.includes('standaard') || tekst_lower.includes('richtlijn')) {
      return { type: 'PRINCIPE', toelichting: 'De tekst beschrijft een principe of standaard.', vertrouwen: 0.75 };
    }
    if (tekst_lower.includes('epic') || tekst_lower.includes('initiatief') || tekst_lower.includes('groot')) {
      return { type: 'EPIC', toelichting: 'De tekst beschrijft een groot initiatief (epic).', vertrouwen: 0.7 };
    }
    if (tekst_lower.includes('user story') || tekst_lower.includes('als gebruiker') || tekst_lower.includes('wil ik')) {
      return { type: 'USER_STORY', toelichting: 'De tekst bevat een user story patroon.', vertrouwen: 0.85 };
    }
    if (tekst_lower.includes('api') || tekst_lower.includes('endpoint') || tekst_lower.includes('interface')) {
      return { type: 'API_CONTRACT', toelichting: 'De tekst beschrijft een API of technische interface.', vertrouwen: 0.8 };
    }
    if (tekst_lower.includes('datamodel') || tekst_lower.includes('entiteit') || tekst_lower.includes('tabel')) {
      return { type: 'DATAMODEL', toelichting: 'De tekst beschrijft een datastructuur of datamodel.', vertrouwen: 0.8 };
    }
    return { type: 'FUNCTIONALITEIT', toelichting: 'Op basis van de tekst lijkt dit een concrete functionaliteit te beschrijven.', vertrouwen: 0.65 };
  }

  private mockAfleidElementen(
    bronElement: any,
    doelType: string,
    bestaandeElementen: any[],
  ): { drafts: ElementVoorstel[]; kandidaten: { elementId: string; score: number; reden: string }[] } {
    const basisTitel = bronElement.titel ?? 'Onbekend element';
    return {
      drafts: [
        {
          titel: `${doelType.replace(/_/g, ' ')} — ${basisTitel}`,
          type: doelType,
          inhoud: `Dit element is afgeleid van "${basisTitel}". Pas de inhoud aan naar de specifieke context van uw ${doelType.toLowerCase().replace(/_/g, ' ')}.`,
          toelichting: `Concept gegenereerd op basis van "${basisTitel}".`,
        },
        {
          titel: `Alternatief ${doelType.replace(/_/g, ' ')} — ${basisTitel}`,
          type: doelType,
          inhoud: `Alternatieve uitwerking van "${basisTitel}" als ${doelType.toLowerCase().replace(/_/g, ' ')}. Pas aan naar uw specifieke behoeften.`,
          toelichting: `Alternatief concept voor verdere verkenning.`,
        },
      ],
      kandidaten: bestaandeElementen.slice(0, 5).map((e: any) => ({
        elementId: e.id,
        score: 65,
        reden: `"${e.titel}" kan mogelijk relevant zijn als ${doelType.replace(/_/g, ' ')} voor dit bron-element.`,
      })),
    };
  }

  private mockConsistentieCheck(nieuw: string, bestaande: string[]) {
    return {
      overlappen:
        bestaande.length > 0
          ? [
              {
                projectNaam: 'Medicatiebeheer v1',
                overlapPercentage: 45,
                beschrijving: 'Beide projecten richten zich op medicatieveiligheid.',
              },
            ]
          : [],
      aanbeveling:
        bestaande.length > 0
          ? 'Er is significante overlap met bestaande projecten. Overweeg samen te werken.'
          : 'Geen significante overlap gevonden. Uw project is uniek.',
    };
  }

  // ─── Multi-provider implementatie (Anthropic → Gemini → Mock) ────────────

  // Robuuste sparring: probeert alle providers, vult provider-info in response
  private async sparringMetFallback(input: SparringBerichtInput): Promise<SparringAntwoord> {
    const systeemPrompt = `Je bent de Sparring-Partner van CareCanvas, een inclusief co-creatieplatform voor Nederlandse zorginnovatie.
Je rol is die van een empathische Socratische gesprekspartner die zorgprofessionals, patiënten en beleidsmakers helpt hun zorgideeën te concretiseren.

Stel gerichte verdiepende vragen. Zodra jij als AI beoordeelt dat het gesprek voldoende informatie bevat om een sterk element te formuleren — ongeacht het aantal uitwisselingen — geef je dit expliciet aan. Dat kan al na één uitwisseling zijn als het idee erg helder is, of pas na meerdere als het complex is.
Wanneer je het element rijp acht, sluit je je bericht af met: "Het element-concept rechts in uw scherm is bijgewerkt en klaar om op te slaan — pas eventueel de titel of inhoud aan en klik op 'Element aanmaken'."

Antwoord altijd in het Nederlands. Wees empathisch, nieuwsgierig en niet-technisch.`;

    // Bereid conversatie voor
    const anthropicMessages = [
      ...input.gesprekGeschiedenis
        .filter((_, i, arr) => i >= arr.findIndex((b) => b.rol === 'gebruiker'))
        .map((b) => ({ role: b.rol === 'gebruiker' ? 'user' : 'assistant', content: b.inhoud })),
      { role: 'user', content: input.nieuweVraag },
    ];
    const geminiContents = [
      ...input.gesprekGeschiedenis
        .filter((_, i, arr) => i >= arr.findIndex((b) => b.rol === 'gebruiker'))
        .map((b) => ({ role: b.rol === 'gebruiker' ? 'user' : 'model', parts: [{ text: b.inhoud }] })),
      { role: 'user', parts: [{ text: input.nieuweVraag }] },
    ];

    let chatTekst: string | null = null;
    let chatProvider = 'mock';
    let chatModel = 'demo-modus';

    // 1. Probeer Anthropic
    if (this.anthropicBeschikbaar) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicApiKey!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.anthropicModel,
            max_tokens: 1024,
            system: systeemPrompt,
            messages: anthropicMessages,
          }),
        });
        const data = (await response.json()) as any;
        const tekst = data.content?.[0]?.text;
        if (tekst && !data.error) {
          chatTekst = tekst;
          chatProvider = 'claude';
          chatModel = this.anthropicModel;
          this.logger.log(`Sparring: Anthropic ${this.anthropicModel} succesvol`);
        } else {
          this.logger.warn(`Anthropic sparring fout: ${data.error?.message ?? 'lege respons'}`);
        }
      } catch (err: any) {
        this.logger.warn(`Anthropic niet bereikbaar: ${err.message}`);
      }
    }

    // 2. Probeer Gemini providers
    if (!chatTekst) {
      for (const { naam, sleutel } of this.geminiProviders) {
        for (const model of this.geminiModellen) {
          try {
            chatTekst = await this.geminiAnroep(sleutel, model, systeemPrompt, geminiContents);
            chatProvider = `gemini (${naam})`;
            chatModel = model;
            this.logger.log(`Sparring: Gemini ${naam}/${model} succesvol`);
            break;
          } catch (err: any) {
            this.logger.warn(`Gemini ${naam}/${model}: ${err.message}`);
          }
          if (chatTekst) break;
        }
        if (chatTekst) break;
      }
    }

    // 3. Mock fallback
    const mockAntwoord = this.mockSparringAntwoord(input);
    const antwoord: SparringAntwoord = chatTekst
      ? { inhoud: chatTekst, isProbleemFormuleringKlaar: false, aiProvider: chatProvider, aiModel: chatModel }
      : { ...mockAntwoord, aiProvider: 'mock', aiModel: 'demo-modus' };

    // Element-extractie + rijpheids­beoordeling parallel
    const [extractResultaat] = await Promise.allSettled([
      this.extraheerElementEnBeoordeelRijpheid(input),
    ]);
    if (extractResultaat.status === 'fulfilled' && extractResultaat.value) {
      const { voorstel, isKlaar } = extractResultaat.value;
      if (voorstel) antwoord.elementVoorstel = voorstel;
      antwoord.isProbleemFormuleringKlaar = isKlaar;
    } else if (!antwoord.elementVoorstel) {
      antwoord.elementVoorstel = mockAntwoord.elementVoorstel;
    }

    return antwoord;
  }

  // Generieke LLM-aanroep: Anthropic → Gemini keys → throw
  private async llmAnroep(systeemPrompt: string, gebruikerPrompt: string): Promise<LLMResultaat> {
    // 1. Anthropic
    if (this.anthropicBeschikbaar) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicApiKey!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: this.anthropicModel,
            max_tokens: 4096,
            system: systeemPrompt,
            messages: [{ role: 'user', content: gebruikerPrompt }],
          }),
        });
        const data = (await response.json()) as any;
        if (data.error) throw new Error(data.error.message);
        const tekst = data.content?.[0]?.text ?? '';
        if (!tekst) throw new Error('Lege Anthropic respons');
        return { tekst, provider: 'claude', model: this.anthropicModel };
      } catch (err: any) {
        this.logger.warn(`Anthropic llmAnroep fout: ${err.message}`);
      }
    }

    // 2. Gemini providers
    for (const { naam, sleutel } of this.geminiProviders) {
      for (const model of this.geminiModellen) {
        try {
          const tekst = await this.geminiAnroep(
            sleutel, model, systeemPrompt,
            [{ role: 'user', parts: [{ text: gebruikerPrompt }] }],
          );
          this.logger.log(`llmAnroep: Gemini ${naam}/${model} succesvol`);
          return { tekst, provider: `gemini (${naam})`, model };
        } catch (err: any) {
          this.logger.warn(`Gemini ${naam}/${model}: ${err.message}`);
        }
      }
    }

    throw new Error('Alle LLM-providers zijn niet beschikbaar');
  }

  // Ruwe Gemini API-aanroep
  private async geminiAnroep(
    sleutel: string,
    model: string,
    systeemPrompt: string,
    contents: { role: string; parts: { text: string }[] }[],
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${sleutel}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systeemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
        }),
      },
    );
    if (!response.ok) {
      const err = (await response.json()) as any;
      throw new Error(`HTTP ${response.status}: ${err.error?.message ?? 'Onbekend'}`);
    }
    const data = (await response.json()) as any;
    const tekst = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!tekst) throw new Error('Lege Gemini respons');
    return tekst;
  }

  // Element-extractie + rijpheids­beoordeling in één LLM-aanroep
  private async extraheerElementEnBeoordeelRijpheid(
    input: SparringBerichtInput,
  ): Promise<{ voorstel?: ElementVoorstel; isKlaar: boolean }> {
    const gesprekTekst = [
      ...input.gesprekGeschiedenis.map((b) => `${b.rol === 'gebruiker' ? 'Gebruiker' : 'AI'}: ${b.inhoud}`),
      `Gebruiker: ${input.nieuweVraag}`,
    ].join('\n\n');

    const typeFormaatInstructies = `
Gebruik voor de 'inhoud' het juiste formaat per type:
- VISIE: "Wij geloven dat... [ambitie]. Onze visie is... [toekomstbeeld]."
- PRINCIPE: "Principe: [stelling]. Rationale: [waarom]. Implicaties: [wat dit betekent in de praktijk]."
- EPIC: "Als [doelgroep] willen wij [capability] zodat [businesswaarde]. Scope: [wat valt wel/niet binnen deze epic]."
- MODULE: "Module [naam]: [doel]. Verantwoordelijkheden: [lijst]. Afhankelijkheden: [andere modules]."
- FUNCTIONALITEIT: "[Beschrijving van gedrag]. Randvoorwaarden: [lijst]. Uitzondering­scenario's: [lijst]."
- FUNCTIONEEL_ONTWERP: "Doel: [...]. Gebruikersgroepen: [...]. Hoofdprocessen: [...]. Schermflow: [...]."
- TECHNISCH_ONTWERP: "Architectuur: [...]. Componenten: [...]. Interfaces: [...]. Technologie­keuzes: [...]."
- USER_STORY: "Als [rol] wil ik [actie] zodat [doel].\n\nAcceptatiecriteria:\n- [...]\n- [...]"
- API_CONTRACT: "Endpoint: [METHODE] /pad\nRequest body: {...}\nResponse 200: {...}\nFoutcodes: [lijst]."
- DATAMODEL: "Entiteit: [naam]\nVelden:\n- [naam] ([type], verplicht/optioneel): [beschrijving]\nRelaties: [...]."`;

    try {
      const resultaat = await this.llmAnroep(
        `Je bent een CareCanvas assistent die sparring-gesprekken analyseert, element-concepten opstelt en beoordeelt of het gesprek voldoende rijp is.
De 10 beschikbare element-types zijn: VISIE, PRINCIPE, EPIC, MODULE, FUNCTIONALITEIT, FUNCTIONEEL_ONTWERP, TECHNISCH_ONTWERP, USER_STORY, API_CONTRACT, DATAMODEL.
Geef altijd valide JSON terug zonder markdown.`,
        `Analyseer het volgende sparring-gesprek en doe twee dingen:
1. Stel een element-concept op in het juiste type-specifieke formaat
2. Beoordeel of het gesprek voldoende informatie bevat voor een sterk element

Gesprek:
${gesprekTekst}

${typeFormaatInstructies}

Een element is KLAAR (isKlaar: true) als het gesprek al het volgende duidelijk maakt:
- Wat het probleem of de behoefte is
- Voor wie het bedoeld is (doelgroep of context)
- Wat de gewenste uitkomst of waarde is
- Welk element-type het beste past

Een element is NIET klaar (isKlaar: false) als bovenstaande nog te vaag of onvolledig is.

Geef ALLEEN dit JSON-object terug:
{
  "isKlaar": true/false,
  "voorstel": {
    "titel": "<prikkelende titel van max 60 tekens>",
    "type": "<TYPE>",
    "inhoud": "<volledig ingevuld in het type-specifieke formaat hierboven>",
    "toelichting": "<één zin: wat beoogt dit element>"
  }
}`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(json);
      return { voorstel: parsed.voorstel as ElementVoorstel, isKlaar: !!parsed.isKlaar };
    } catch (err: any) {
      this.logger.warn(`Element-extractie fout: ${err.message}`);
      return { isKlaar: false };
    }
  }

  // Document-extractie met provider fallback
  private async documentNaarElementenMetFallback(document: string): Promise<ElementVoorstel[]> {
    try {
      const resultaat = await this.llmAnroep(
        `Je bent een CareCanvas architect die documenten analyseert en omzet naar element-concepten voor zorginnovatie.
De 10 beschikbare element-types zijn: VISIE, PRINCIPE, EPIC, MODULE, FUNCTIONALITEIT, FUNCTIONEEL_ONTWERP, TECHNISCH_ONTWERP, USER_STORY, API_CONTRACT, DATAMODEL.
Geef altijd valide JSON terug zonder markdown.`,
        `Analyseer het volgende document en extraheer afzonderlijke elementen:\n\n${document.substring(0, 8000)}\n\nGeef ALLEEN een JSON-array terug (maximaal 12 elementen, abstract naar concreet):\n[{ "titel": "<titel>", "type": "<TYPE>", "inhoud": "<inhoud>", "toelichting": "<één zin>" }]`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json) as ElementVoorstel[];
    } catch (err: any) {
      this.logger.warn(`Document-extractie fout: ${err.message} — terug naar mock`);
      return this.mockDocumentNaarElementen(document);
    }
  }

  // Classificeer met provider fallback
  private async classificeerElementMetFallback(tekst: string): Promise<{ type: string; toelichting: string; vertrouwen: number }> {
    try {
      const resultaat = await this.llmAnroep(
        `Je bent een CareCanvas assistent die teksten classificeert in element-types voor zorginnovatie.
De beschikbare types zijn: VISIE, PRINCIPE, EPIC, MODULE, FUNCTIONALITEIT, FUNCTIONEEL_ONTWERP, TECHNISCH_ONTWERP, USER_STORY, API_CONTRACT, DATAMODEL.
Geef altijd valide JSON terug zonder markdown.`,
        `Classificeer de volgende tekst in één van de 10 element-types.\n\nTekst: "${tekst}"\n\nGeef ALLEEN een JSON-object terug:\n{ "type": "<TYPE>", "toelichting": "<korte uitleg waarom>", "vertrouwen": <0.0-1.0> }`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json);
    } catch (err: any) {
      this.logger.warn(`Classificeer fout: ${err.message} — terug naar mock`);
      return this.mockClassificeerElement(tekst);
    }
  }

  // Specificaties genereren met provider fallback
  private async genereerSpecificatiesMetFallback(probleemFormulering: string, context: string) {
    this.logger.log('LLM: specificaties genereren');
    try {
      const resultaat = await this.llmAnroep(
        `Je bent een zorgdomein architect die User Stories, datamodellen en API-contracten genereert voor Nederlandse zorginnovatieprojecten.
Genereer altijd valide JSON zonder markdown code blocks. Gebruik Nederlandse veldnamen en ZIB-referenties waar relevant.`,
        `Genereer specificaties voor het volgende zorgproject:\n\nProbleemformulering: ${probleemFormulering}\nContext: ${context}\n\nGeef ALLEEN een JSON-object terug met deze structuur:\n{\n  "userStories": [{ "id": "US-001", "als": "<rol>", "wil": "<actie>", "zodat": "<doel>", "acceptatieCriteria": ["<criterium>"], "prioriteit": "MUST", "zibReferenties": ["<ZIB-naam>"] }],\n  "dataEntiteiten": [{ "naam": "<naam>", "beschrijving": "<beschrijving>", "velden": [{ "naam": "<veld>", "type": "string", "verplicht": true, "beschrijving": "<beschrijving>", "fhirPath": "<FHIR.Path>" }], "zibKoppeling": "<nl.zorg.Naam>" }],\n  "apiContracten": [{ "endpoint": "/api/v1/<pad>", "methode": "GET", "beschrijving": "<beschrijving>", "fhirResource": "<Resource>", "responses": { "200": { "description": "<beschrijving>" } } }],\n  "zibMappings": [{ "dataElement": "<element>", "zibNaam": "<ZIB>", "zibVeld": "<veld>", "fhirPath": "<pad>" }]\n}\n\nGenereer minimaal 3 user stories en 2 dataentiteiten die direct relevant zijn voor de beschreven probleemformulering.`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json);
    } catch (err: any) {
      this.logger.warn(`Specs fout: ${err.message} — terug naar mock`);
      return this.mockSpecificaties(probleemFormulering);
    }
  }

  // Compliance scan met provider fallback
  private async scanComplianceMetFallback(projectBeschrijving: string) {
    this.logger.log('LLM: compliance scan uitvoeren');
    try {
      const resultaat = await this.llmAnroep(
        `Je bent een compliance expert voor de Nederlandse zorgsector gespecialiseerd in AVG, NEN 7510, NEN 7513, WGBO en FHIR.
Analyseer zorgprojectbeschrijvingen en geef concrete compliance-bevindingen. Geef altijd valide JSON terug zonder markdown code blocks.`,
        `Voer een compliance scan uit op het volgende zorgproject:\n\n${projectBeschrijving}\n\nGeef ALLEEN een JSON-object terug:\n{\n  "algemeenOordeel": "GROEN",\n  "gescandOp": "${new Date().toISOString()}",\n  "bevindingen": [{ "id": "BEVINDING-001", "categorie": "AVG", "ernst": "ORANJE", "titel": "<korte titel>", "beschrijving": "<concrete bevinding>", "aanbeveling": "<concrete actie>", "regelReferentie": "<wet artikel>", "opgelost": false }],\n  "geblokkeerd": false\n}\n\nGeef minimaal 4 bevindingen. algemeenOordeel is ROOD bij rode bevindingen, anders ORANJE bij oranje, anders GROEN.`,
      );
      const json = resultaat.tekst.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(json);
    } catch (err: any) {
      this.logger.warn(`Compliance fout: ${err.message} — terug naar mock`);
      return this.mockComplianceScan(projectBeschrijving);
    }
  }

}
