export enum ElementType {
  VISIE = 'VISIE',
  PRINCIPE = 'PRINCIPE',
  EPIC = 'EPIC',
  MODULE = 'MODULE',
  FUNCTIONALITEIT = 'FUNCTIONALITEIT',
  FUNCTIONEEL_ONTWERP = 'FUNCTIONEEL_ONTWERP',
  TECHNISCH_ONTWERP = 'TECHNISCH_ONTWERP',
  USER_STORY = 'USER_STORY',
  API_CONTRACT = 'API_CONTRACT',
  DATAMODEL = 'DATAMODEL',
}

export enum ElementStatus {
  CONCEPT = 'CONCEPT',
  IN_DISCUSSIE = 'IN_DISCUSSIE',
  TER_VASTSTELLING = 'TER_VASTSTELLING',
  VASTGESTELD = 'VASTGESTELD',
  IN_UITWERKING = 'IN_UITWERKING',
  IN_REVIEW = 'IN_REVIEW',
  GEPUBLICEERD = 'GEPUBLICEERD',
  SPECIFICATIE = 'SPECIFICATIE',
  COMPLIANCE = 'COMPLIANCE',
  VERFIJND = 'VERFIJND',
  GEREED = 'GEREED',
  GOEDGEKEURD = 'GOEDGEKEURD',
}

export const ELEMENT_WORKFLOW: Record<ElementType, ElementStatus[]> = {
  [ElementType.VISIE]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_DISCUSSIE,
    ElementStatus.TER_VASTSTELLING,
    ElementStatus.VASTGESTELD,
  ],
  [ElementType.PRINCIPE]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_DISCUSSIE,
    ElementStatus.TER_VASTSTELLING,
    ElementStatus.VASTGESTELD,
  ],
  [ElementType.EPIC]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_UITWERKING,
    ElementStatus.IN_REVIEW,
    ElementStatus.GEPUBLICEERD,
  ],
  [ElementType.MODULE]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_UITWERKING,
    ElementStatus.IN_REVIEW,
    ElementStatus.GEPUBLICEERD,
  ],
  [ElementType.FUNCTIONALITEIT]: [
    ElementStatus.CONCEPT,
    ElementStatus.SPECIFICATIE,
    ElementStatus.COMPLIANCE,
    ElementStatus.VERFIJND,
    ElementStatus.GEREED,
  ],
  [ElementType.FUNCTIONEEL_ONTWERP]: [
    ElementStatus.CONCEPT,
    ElementStatus.SPECIFICATIE,
    ElementStatus.COMPLIANCE,
    ElementStatus.VERFIJND,
    ElementStatus.GEREED,
  ],
  [ElementType.TECHNISCH_ONTWERP]: [
    ElementStatus.CONCEPT,
    ElementStatus.SPECIFICATIE,
    ElementStatus.COMPLIANCE,
    ElementStatus.VERFIJND,
    ElementStatus.GEREED,
  ],
  [ElementType.USER_STORY]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_UITWERKING,
    ElementStatus.IN_REVIEW,
    ElementStatus.GOEDGEKEURD,
  ],
  [ElementType.API_CONTRACT]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_UITWERKING,
    ElementStatus.IN_REVIEW,
    ElementStatus.GOEDGEKEURD,
  ],
  [ElementType.DATAMODEL]: [
    ElementStatus.CONCEPT,
    ElementStatus.IN_UITWERKING,
    ElementStatus.IN_REVIEW,
    ElementStatus.GOEDGEKEURD,
  ],
};

export const GOEDGEKEURDE_STATUSSEN: ElementStatus[] = [
  ElementStatus.VASTGESTELD,
  ElementStatus.GEPUBLICEERD,
  ElementStatus.GOEDGEKEURD,
  ElementStatus.GEREED,
];

export const ELEMENT_TYPE_KLEUR: Record<ElementType, string> = {
  [ElementType.VISIE]: 'bg-purple-100 text-purple-700',
  [ElementType.PRINCIPE]: 'bg-indigo-100 text-indigo-700',
  [ElementType.EPIC]: 'bg-blue-100 text-blue-700',
  [ElementType.MODULE]: 'bg-cyan-100 text-cyan-700',
  [ElementType.FUNCTIONALITEIT]: 'bg-teal-100 text-teal-700',
  [ElementType.FUNCTIONEEL_ONTWERP]: 'bg-green-100 text-green-700',
  [ElementType.TECHNISCH_ONTWERP]: 'bg-lime-100 text-lime-700',
  [ElementType.USER_STORY]: 'bg-yellow-100 text-yellow-700',
  [ElementType.API_CONTRACT]: 'bg-orange-100 text-orange-700',
  [ElementType.DATAMODEL]: 'bg-red-100 text-red-700',
};

export const ELEMENT_STATUS_KLEUR: Record<ElementStatus, string> = {
  [ElementStatus.CONCEPT]: 'bg-gray-100 text-gray-600',
  [ElementStatus.IN_DISCUSSIE]: 'bg-blue-100 text-blue-700',
  [ElementStatus.TER_VASTSTELLING]: 'bg-orange-100 text-orange-700',
  [ElementStatus.VASTGESTELD]: 'bg-green-100 text-green-700',
  [ElementStatus.IN_UITWERKING]: 'bg-blue-100 text-blue-700',
  [ElementStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
  [ElementStatus.GEPUBLICEERD]: 'bg-green-100 text-green-700',
  [ElementStatus.SPECIFICATIE]: 'bg-cyan-100 text-cyan-700',
  [ElementStatus.COMPLIANCE]: 'bg-purple-100 text-purple-700',
  [ElementStatus.VERFIJND]: 'bg-teal-100 text-teal-700',
  [ElementStatus.GEREED]: 'bg-green-100 text-green-700',
  [ElementStatus.GOEDGEKEURD]: 'bg-green-100 text-green-700',
};

export const ELEMENT_TYPE_LABEL: Record<ElementType, string> = {
  [ElementType.VISIE]: 'Visie',
  [ElementType.PRINCIPE]: 'Principe',
  [ElementType.EPIC]: 'Epic',
  [ElementType.MODULE]: 'Module',
  [ElementType.FUNCTIONALITEIT]: 'Functionaliteit',
  [ElementType.FUNCTIONEEL_ONTWERP]: 'Functioneel Ontwerp',
  [ElementType.TECHNISCH_ONTWERP]: 'Technisch Ontwerp',
  [ElementType.USER_STORY]: 'User Story',
  [ElementType.API_CONTRACT]: 'API Contract',
  [ElementType.DATAMODEL]: 'Datamodel',
};

// ── Relatie types ────────────────────────────────────────────────────────────

export enum RelatieType {
  AFGELEID_VAN = 'AFGELEID_VAN',   // child → parent: "X vloeit voort uit Y"
  IMPLEMENTEERT = 'IMPLEMENTEERT', // technische/functionele uitwerking → bron
  VERWIJST_NAAR = 'VERWIJST_NAAR', // laterale verwijzing, geen hiërarchie
}

/**
 * Afleidingstabel: per ElementType welke doeltypen (+ bijbehorend relatietype)
 * er logisch uit kunnen voortvloeien.
 * Richting-conventie: van = kind/afgeleid element, naar = ouder/bronelement.
 */
export const AFLEID_NAAR: Partial<Record<ElementType, { type: ElementType; relatie: RelatieType }[]>> = {
  [ElementType.VISIE]: [
    { type: ElementType.PRINCIPE, relatie: RelatieType.AFGELEID_VAN },
    { type: ElementType.EPIC,     relatie: RelatieType.AFGELEID_VAN },
  ],
  [ElementType.PRINCIPE]: [
    { type: ElementType.EPIC,            relatie: RelatieType.AFGELEID_VAN },
    { type: ElementType.FUNCTIONALITEIT, relatie: RelatieType.AFGELEID_VAN },
  ],
  [ElementType.EPIC]: [
    { type: ElementType.MODULE,          relatie: RelatieType.AFGELEID_VAN },
    { type: ElementType.FUNCTIONALITEIT, relatie: RelatieType.AFGELEID_VAN },
    { type: ElementType.USER_STORY,      relatie: RelatieType.AFGELEID_VAN },
  ],
  [ElementType.MODULE]: [
    { type: ElementType.FUNCTIONALITEIT,   relatie: RelatieType.AFGELEID_VAN },
    { type: ElementType.TECHNISCH_ONTWERP, relatie: RelatieType.IMPLEMENTEERT },
    { type: ElementType.DATAMODEL,         relatie: RelatieType.IMPLEMENTEERT },
  ],
  [ElementType.FUNCTIONALITEIT]: [
    { type: ElementType.FUNCTIONEEL_ONTWERP, relatie: RelatieType.IMPLEMENTEERT },
    { type: ElementType.TECHNISCH_ONTWERP,   relatie: RelatieType.IMPLEMENTEERT },
    { type: ElementType.USER_STORY,          relatie: RelatieType.AFGELEID_VAN },
  ],
  [ElementType.FUNCTIONEEL_ONTWERP]: [
    { type: ElementType.TECHNISCH_ONTWERP, relatie: RelatieType.IMPLEMENTEERT },
    { type: ElementType.USER_STORY,        relatie: RelatieType.AFGELEID_VAN },
  ],
  [ElementType.TECHNISCH_ONTWERP]: [
    { type: ElementType.API_CONTRACT, relatie: RelatieType.IMPLEMENTEERT },
    { type: ElementType.DATAMODEL,    relatie: RelatieType.IMPLEMENTEERT },
  ],
  [ElementType.USER_STORY]: [
    { type: ElementType.API_CONTRACT, relatie: RelatieType.VERWIJST_NAAR },
    { type: ElementType.DATAMODEL,    relatie: RelatieType.VERWIJST_NAAR },
  ],
  [ElementType.API_CONTRACT]: [
    { type: ElementType.DATAMODEL, relatie: RelatieType.VERWIJST_NAAR },
  ],
};
