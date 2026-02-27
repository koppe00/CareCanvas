export enum UserRole {
  DROMER = 'DROMER',
  GIDS = 'GIDS',
  ARCHITECT = 'ARCHITECT',
  BOUWER = 'BOUWER',
  VALIDATOR = 'VALIDATOR',
  BEHEERDER = 'BEHEERDER',
}

export enum ZorgDomein {
  ONCOLOGIE = 'ONCOLOGIE',
  CARDIOLOGIE = 'CARDIOLOGIE',
  NEUROLOGIE = 'NEUROLOGIE',
  PSYCHIATRIE = 'PSYCHIATRIE',
  GERIATRIE = 'GERIATRIE',
  KINDERGENEESKUNDE = 'KINDERGENEESKUNDE',
  SPOEDEISENDE_HULP = 'SPOEDEISENDE_HULP',
  EERSTELIJNS_ZORG = 'EERSTELIJNS_ZORG',
  GEESTELIJKE_GEZONDHEIDSZORG = 'GEESTELIJKE_GEZONDHEIDSZORG',
  VERPLEEGHUISZORG = 'VERPLEEGHUISZORG',
  THUISZORG = 'THUISZORG',
  OVERIG = 'OVERIG',
}

export interface User {
  id: string;
  email: string;
  naam: string;
  rollen: UserRole[];
  zorgDomeinen: ZorgDomein[];
  bigRegistratie?: string;
  bigGeverifieerd: boolean;
  organisatie?: string;
  bio?: string;
  vertrouwensScore: number;
  aangemeldOp: Date;
  actief: boolean;
}

export interface UserProfile extends User {
  projecten: string[]; // project IDs
  stempels: string[];  // stempel IDs
  bijdragen: number;
}
