/**
 * Lokale kopie van relatie-gerelateerde types uit @carecanvas/shared.
 * Noodzakelijk omdat Next.js/Turbopack externe TypeScript-bronbestanden
 * buiten de projectgrens niet compileert via tsconfig-paden.
 */

export enum RelatieType {
  AFGELEID_VAN = 'AFGELEID_VAN',
  IMPLEMENTEERT = 'IMPLEMENTEERT',
  VERWIJST_NAAR = 'VERWIJST_NAAR',
}

export const ELEMENT_TYPE_LABEL: Record<string, string> = {
  VISIE:               'Visie',
  PRINCIPE:            'Principe',
  EPIC:                'Epic',
  MODULE:              'Module',
  FUNCTIONALITEIT:     'Functionaliteit',
  FUNCTIONEEL_ONTWERP: 'Functioneel Ontwerp',
  TECHNISCH_ONTWERP:   'Technisch Ontwerp',
  USER_STORY:          'User Story',
  API_CONTRACT:        'API Contract',
  DATAMODEL:           'Datamodel',
};

export const AFLEID_NAAR: Partial<Record<string, { type: string; relatie: RelatieType }[]>> = {
  VISIE: [
    { type: 'PRINCIPE', relatie: RelatieType.AFGELEID_VAN },
    { type: 'EPIC',     relatie: RelatieType.AFGELEID_VAN },
  ],
  PRINCIPE: [
    { type: 'EPIC',            relatie: RelatieType.AFGELEID_VAN },
    { type: 'FUNCTIONALITEIT', relatie: RelatieType.AFGELEID_VAN },
  ],
  EPIC: [
    { type: 'MODULE',          relatie: RelatieType.AFGELEID_VAN },
    { type: 'FUNCTIONALITEIT', relatie: RelatieType.AFGELEID_VAN },
    { type: 'USER_STORY',      relatie: RelatieType.AFGELEID_VAN },
  ],
  MODULE: [
    { type: 'FUNCTIONALITEIT',   relatie: RelatieType.AFGELEID_VAN },
    { type: 'TECHNISCH_ONTWERP', relatie: RelatieType.IMPLEMENTEERT },
    { type: 'DATAMODEL',         relatie: RelatieType.IMPLEMENTEERT },
  ],
  FUNCTIONALITEIT: [
    { type: 'FUNCTIONEEL_ONTWERP', relatie: RelatieType.IMPLEMENTEERT },
    { type: 'TECHNISCH_ONTWERP',   relatie: RelatieType.IMPLEMENTEERT },
    { type: 'USER_STORY',          relatie: RelatieType.AFGELEID_VAN },
  ],
  FUNCTIONEEL_ONTWERP: [
    { type: 'TECHNISCH_ONTWERP', relatie: RelatieType.IMPLEMENTEERT },
    { type: 'USER_STORY',        relatie: RelatieType.AFGELEID_VAN },
  ],
  TECHNISCH_ONTWERP: [
    { type: 'API_CONTRACT', relatie: RelatieType.IMPLEMENTEERT },
    { type: 'DATAMODEL',    relatie: RelatieType.IMPLEMENTEERT },
  ],
  USER_STORY: [
    { type: 'API_CONTRACT', relatie: RelatieType.VERWIJST_NAAR },
    { type: 'DATAMODEL',    relatie: RelatieType.VERWIJST_NAAR },
  ],
  API_CONTRACT: [
    { type: 'DATAMODEL', relatie: RelatieType.VERWIJST_NAAR },
  ],
};
