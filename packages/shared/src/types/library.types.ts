import { ZorgDomein } from './user.types';
import { ArtifactType, ComplianceStatus } from './project.types';
import { StempelType } from './stamp.types';

export enum BlokjeCategorie {
  DATAMODEL = 'DATAMODEL',
  USER_STORY_SET = 'USER_STORY_SET',
  UI_PATROON = 'UI_PATROON',
  API_CONTRACT = 'API_CONTRACT',
  PROCES_DIAGRAM = 'PROCES_DIAGRAM',
  COMPLIANCE_TEMPLATE = 'COMPLIANCE_TEMPLATE',
  FHIR_PROFIEL = 'FHIR_PROFIEL',
}

export interface Blokje {
  id: string;
  naam: string;
  beschrijving: string;
  categorie: BlokjeCategorie;
  zorgDomeinen: ZorgDomein[];
  inhoud: string; // JSON
  type: ArtifactType;
  versie: string;
  aangemaakt Door: string; // gebruiker ID
  aangemaakt Op: Date;
  bijgewerkt Op: Date;
  stempels: StempelType[];
  complianceStatus: ComplianceStatus;
  afkomstig Van?: string; // blokje ID van origineel bij fork
  forks: string[]; // blokje IDs
  gebruiken: number; // hoeveel projecten gebruiken dit blokje
  tags: string[];
  isPubliek: boolean;
  licentie: 'CC-BY-SA' | 'MIT' | 'Apache-2.0';
}

export interface BlokjeZoekFilter {
  zoekterm?: string;
  categorie?: BlokjeCategorie;
  zorgDomein?: ZorgDomein;
  stempelTypes?: StempelType[];
  tags?: string[];
}
