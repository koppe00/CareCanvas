export interface SparringBericht {
  rol: 'gebruiker' | 'ai';
  inhoud: string;
  tijdstip: Date;
}

export interface SparringGesprek {
  id: string;
  projectId?: string;
  berichten: SparringBericht[];
  probleemFormulering?: string;
  aantalVragen: number;
  voltooid: boolean;
  aangemaaktOp: Date;
}

export interface SpecGeneratorInput {
  probleemFormulering: string;
  doelGroep: string;
  zorgContext: string;
  gesprekId: string;
}

export interface SpecGeneratorOutput {
  userStories: GeneratedUserStory[];
  dataEntiteiten: DataEntiteit[];
  apiContracten: ApiContract[];
  zibMappings: ZibMapping[];
  acceptatieCriteria: AcceptatieCriterium[];
}

export interface GeneratedUserStory {
  id: string;
  als: string;
  wil: string;
  zodat: string;
  acceptatieCriteria: string[];
  prioriteit: 'MUST' | 'SHOULD' | 'COULD' | 'WONT';
  zibReferenties: string[];
}

export interface DataEntiteit {
  naam: string;
  beschrijving: string;
  velden: DataVeld[];
  zibKoppeling?: string;
}

export interface DataVeld {
  naam: string;
  type: string;
  verplicht: boolean;
  beschrijving: string;
  fhirPath?: string;
}

export interface ApiContract {
  endpoint: string;
  methode: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  beschrijving: string;
  requestBody?: Record<string, unknown>;
  responses: Record<string, unknown>;
  fhirResource?: string;
}

export interface ZibMapping {
  dataElement: string;
  zibNaam: string;
  zibVeld: string;
  fhirPath: string;
}

export interface AcceptatieCriterium {
  userStoryId: string;
  criterium: string;
  testStappen: string[];
}

export interface ComplianceScanResultaat {
  projectId: string;
  gescandOp: Date;
  algemeenOordeel: 'GROEN' | 'ORANJE' | 'ROOD';
  bevindingen: ComplianceBevinding[];
  geblokkeerd: boolean;
}

export interface ComplianceBevinding {
  id: string;
  categorie: 'AVG' | 'NEN_7510' | 'NEN_7513' | 'WGBO' | 'MDR';
  ernst: 'GROEN' | 'ORANJE' | 'ROOD';
  titel: string;
  beschrijving: string;
  aanbeveling: string;
  regelReferentie: string;
  opgelost: boolean;
}
