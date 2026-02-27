// Types
export * from './types/user.types';
export * from './types/project.types';
export * from './types/stamp.types';
export * from './types/library.types';
export * from './types/ai.types';
export * from './types/element.types';

// Constanten
export const CARECANVAS_VERSIE = '1.0.0';

export const GRONDWET_PRINCIPES = [
  {
    nummer: 'I',
    naam: 'Menselijke Maat',
    beschrijving:
      'Technologie dient altijd de zorgverlener en patiënt, niet andersom.',
  },
  {
    nummer: 'II',
    naam: 'Interoperabiliteit by Design',
    beschrijving:
      'Alles wat gebouwd wordt, communiceert met bestaande systemen via ZIB\'s en FHIR R4/R5.',
  },
  {
    nummer: 'III',
    naam: 'Radicale Transparantie',
    beschrijving:
      'Alle ontwerpen, beslissingslogica en AI-redenering zijn inzichtelijk voor de community.',
  },
  {
    nummer: 'IV',
    naam: 'Inclusieve Eigenaarschap',
    beschrijving:
      'Patiënten en naasten zijn medeontwerpende stemmen, geen testsubjecten.',
  },
] as const;

export const ROL_BESCHRIJVINGEN: Record<string, string> = {
  DROMER:
    'Zorgprofessional, patiënt, mantelzorger of beleidsmaker met een visie op betere zorg.',
  GIDS: 'Ervaren zorgprofessional of domeinexpert die medische validatie en ethische toetsing levert.',
  ARCHITECT:
    'Informatiespecialist, data-analist, UX-ontwerper of product owner die specificaties opstelt.',
  BOUWER:
    'Softwareontwikkelaar, DevOps-engineer, leverancier of AI-coding-agent die bouwt.',
  VALIDATOR:
    'Patiëntvertegenwoordiger, privacy-officer, compliance-specialist of klinisch onderzoeker.',
  BEHEERDER: 'Platformadministrator die het overzicht bewaakt en standaarden borgt.',
};
