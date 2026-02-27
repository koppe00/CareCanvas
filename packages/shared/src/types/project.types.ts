import { ZorgDomein } from './user.types';

export enum ProjectStatus {
  IDEE = 'IDEE',
  VERDIEPING = 'VERDIEPING',
  SPECIFICATIE = 'SPECIFICATIE',
  REVIEW = 'REVIEW',
  COMPLIANCE = 'COMPLIANCE',
  GEPUBLICEERD = 'GEPUBLICEERD',
  GEARCHIVEERD = 'GEARCHIVEERD',
}

export enum ArtifactType {
  USER_STORY = 'USER_STORY',
  DATAMODEL = 'DATAMODEL',
  STROOMSCHEMA = 'STROOMSCHEMA',
  API_CONTRACT = 'API_CONTRACT',
  COMPLIANCE_RAPPORT = 'COMPLIANCE_RAPPORT',
  BLUEPRINT = 'BLUEPRINT',
  CANVAS_UPLOAD = 'CANVAS_UPLOAD',
  OCR_OUTPUT = 'OCR_OUTPUT',
}

export enum ComplianceStatus {
  NIET_GESCAND = 'NIET_GESCAND',
  GROEN = 'GROEN',
  ORANJE = 'ORANJE',
  ROOD = 'ROOD',
}

export interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  zorgDomein: ZorgDomein;
  status: ProjectStatus;
  eigenaarId: string;
  deelnemers: ProjectDeelnemer[];
  artefacts: string[]; // artefact IDs
  stempels: string[];  // stempel IDs
  complianceStatus: ComplianceStatus;
  versie: string;
  aangemeldOp: Date;
  bijgewerktOp: Date;
  gepubliceerdOp?: Date;
  tags: string[];
  isPubliek: boolean;
  gebasseerdOp?: string; // blokje ID bij fork
}

export interface ProjectDeelnemer {
  gebruikerId: string;
  rol: string;
  toegevoegdOp: Date;
}

export interface Artifact {
  id: string;
  projectId: string;
  type: ArtifactType;
  titel: string;
  inhoud: string; // JSON string voor structured content
  versie: string;
  aangemaaktDoor: string;
  aangemaaktOp: Date;
  bijgewerktOp: Date;
  stempels: string[]; // stempel IDs
  bestandsUrl?: string; // voor uploads
  metadata?: Record<string, unknown>;
}

export interface UserStory {
  als: string;      // rol
  wil: string;      // actie
  zodat: string;    // resultaat
  acceptatieCriteria: string[];
  prioriteit: 'MUST' | 'SHOULD' | 'COULD' | 'WONT';
}

export interface Stroomschema {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  metadata: {
    happyPath: string[];
    sadPath: string[];
    edgeCases: string[];
  };
}

export interface SchemaNode {
  id: string;
  label: string;
  type: 'start' | 'end' | 'actie' | 'beslissing' | 'systeem';
  actor?: string;
}

export interface SchemaEdge {
  van: string;
  naar: string;
  label?: string;
  conditie?: string;
}
