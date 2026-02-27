import { UserRole } from './user.types';

export enum StempelType {
  MEDISCH_VEILIG = 'MEDISCH_VEILIG',
  PRIVACY_CONFORM = 'PRIVACY_CONFORM',
  PATIENT_GEVALIDEERD = 'PATIENT_GEVALIDEERD',
  TECHNISCH_HAALBAAR = 'TECHNISCH_HAALBAAR',
  FHIR_COMPLIANT = 'FHIR_COMPLIANT',
}

export const StempelVereisten: Record<StempelType, UserRole[]> = {
  [StempelType.MEDISCH_VEILIG]: [UserRole.GIDS, UserRole.VALIDATOR],
  [StempelType.PRIVACY_CONFORM]: [UserRole.VALIDATOR],
  [StempelType.PATIENT_GEVALIDEERD]: [UserRole.VALIDATOR],
  [StempelType.TECHNISCH_HAALBAAR]: [UserRole.ARCHITECT, UserRole.BOUWER],
  [StempelType.FHIR_COMPLIANT]: [UserRole.ARCHITECT, UserRole.BOUWER],
};

export const StempelBeschrijvingen: Record<StempelType, string> = {
  [StempelType.MEDISCH_VEILIG]: 'Klinische risico\'s zijn beoordeeld door een BIG-geregistreerde zorgverlener',
  [StempelType.PRIVACY_CONFORM]: 'AVG-toetsing positief doorlopen door een Functionaris Gegevensbescherming',
  [StempelType.PATIENT_GEVALIDEERD]: 'Ervaringsperspectief verwerkt en gevalideerd door een patiëntvertegenwoordiger',
  [StempelType.TECHNISCH_HAALBAAR]: 'Implementeerbaarheid bevestigd door een Senior Architect of Lead Developer',
  [StempelType.FHIR_COMPLIANT]: 'Interoperabiliteit gewaarborgd door een HL7 Nederland gecertificeerde specialist',
};

export interface Stempel {
  id: string;
  type: StempelType;
  artefactId: string;
  projectId: string;
  afgegeven Door: string; // gebruiker ID
  afgegeven Op: Date;
  opmerking?: string;
  geldig: boolean;
}
