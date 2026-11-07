/* SCHÉMA DE RÉFÉRENCE DES MAQUETTES (Google Stitch, reçu le 07/11/2026), repris tel quel.
 *
 * STATUT : VOCABULAIRE DE RÉFÉRENCE, PAS LE CONTRAT DES DONNÉES PUBLIÉES. Aucun écran ni script ne
 * l'importe. Les données de Repère gardent leur forme actuelle tant que ces écarts ne sont pas tranchés
 * (détail : RAPPORT-SCHEMA-STITCH.md à la racine du dépôt) :
 *  - aucune provenance par chiffre (invariant 4) : seul `derniereMiseAJour` existe, au niveau du budget ;
 *  - `photoUrl` : une adresse distante. Les photos de Repère sont des vignettes Commons servies par
 *    département, jamais chargées ailleurs (D27, invariant 1) ;
 *  - `nonVotant` et le vote 'NonVotant' par député : Repère n'affiche ni présence ni absence (invariant 8) ;
 *  - `ecartExplication`, `resumeTexte`, `contenuMarkdown` : du texte rédigé, que Repère ne crée pas
 *    sans source ;
 *  - `PoliticalGroupCode` ('DR', 'Dem', 'EcoS', 'UDR') diffère des sigles de palette.ts ('LR', 'DEM', 'LÉ',
 *    pas d'UDR) ;
 *  - les valeurs « ex: » des commentaires sont celles des maquettes : NON VÉRIFIÉES, jamais à afficher.
 * Le contrôle (mono/tests/local-types.test.mjs) vérifie seulement que ce fichier compile en strict. */

/**
 * SCHÉMA DE DONNÉES TYPESCRIPT — APPLICATION CITOYENNE « REPÈRE »
 * Modèle de données normalisé pour la restitution Open Data institutionnelle
 * (Sources certifiées : data.gouv.fr, OFGL, DGFiP, Assemblée nationale, Sénat, RNE)
 */

// ==========================================
// 1. GÉOGRAPHIE & LOCALISATION CIVIQUE
// ==========================================

export interface TerritoryContext {
  codeInsee: string;            // ex: "77288" (Melun)
  postalCode: string;           // ex: "77000"
  cityName: string;             // ex: "Melun"
  departmentCode: string;       // ex: "77"
  departmentName: string;       // ex: "Seine-et-Marne"
  regionName: string;           // ex: "Île-de-France"
  circonscription: number;      // ex: 1 (1re circonscription de Seine-et-Marne)
  cantonName: string;           // ex: "Canton de Melun"
  intercommunalite: {
    nom: string;                // ex: "Communauté d'Agglomération Melun Val de Seine (CAMVS)"
    nombreCommunes: number;     // ex: 20
  };
  populationLegale: number;     // ex: 42367
  anneeRecensement: number;     // ex: 2024
}

// ==========================================
// 2. FINANCES PUBLIQUES & BUDGET COMMUNAL
// ==========================================

export interface BudgetBreakdownCategory {
  id: 'agents_salaires' | 'investissements' | 'achats_gestion' | 'dette_interets' | 'autres';
  label: string;                // ex: "Salaires & agents"
  partPourCentEuros: number;    // Montant sur 100 € dépensés (ex: 45)
  montantTotalEuros: number;    // Total consolidé (ex: 49300000)
  pourcentage: number;          // ex: 45.0
  colorHex: string;             // Token couleur design system
}

export interface BudgetEvolutionItem {
  key: 'depenses' | 'recettes' | 'dette';
  label: string;                // ex: "Ce qu'elle dépense"
  anneePrecedente: number;      // 2024 (ex: 101099202)
  anneeEnCours: number;         // 2025 (ex: 109595615)
  variationMontant: number;     // ex: +8496413
  variationPourcentage: number; // ex: +8.4
}

export interface StateFundedProject {
  id: string;                   // ex: "proj-dsil-2025-01"
  titre: string;                // ex: "Sécurisation et modernisation des espaces publics et rénovation thermique"
  categorie: 'Securisation' | 'Ecoles & Enfance' | 'Mobilites' | 'Patrimoine' | 'Transition ecologique';
  statut: 'Prevu' | 'En cours' | 'Livre';
  quartier?: string;            // ex: "Centre-ville & Schuman"
  description: string;
  dispositifAide: 'DSIL' | 'DETR' | 'Fonds Vert' | 'FIPD' | 'DRAC' | 'Autre';
  anneeExercice: number;        // ex: 2025
  montantTotalTTC: number;      // ex: 444631
  financementEtat: {
    montant: number;            // ex: 355705
    pourcentage: number;        // ex: 80.0
  };
  financementCommune: {
    montant: number;            // ex: 88926
    pourcentage: number;        // ex: 20.0
  };
  deliberationNumero?: string;  // ex: "CM-2024-11/04"
  dateLivraisonPrevue?: string; // ex: "2025-09"
}

export interface MunicipalBudgetProfile {
  exercice: number;             // ex: 2025
  derniereMiseAJour: string;    // ISO Date
  sourceCertification: 'OFGL' | 'DGFiP' | 'arrete_prefectoral';
  depenseTotaleConsolidee: number; // ex: 109600000 (109,6 M€)
  depenseParHabitant: number;   // ex: 2495
  variationAnnuelleHabitantPourcent: number; // ex: +5.2
  medianeStrateRegionale: {
    strateDescription: string;  // ex: "Communes 20 000 à 50 000 hab. en Île-de-France"
    montantParHabitant: number; // ex: 1407
    ecartExplication: string;   // Explication neutre des charges de centralité
  };
  repartitionCentEuros: BudgetBreakdownCategory[];
  evolutionFlux: BudgetEvolutionItem[];
  dotationsEtat: {
    montantTotalSubventionne: number; // ex: 4820400
    coutGlobalChantiers: number;      // ex: 7150000
    partEtatGlobalPourcent: number;   // ex: 67.4
    partCommuneGlobalPourcent: number;// ex: 32.6
    nombreProjetsTotal: number;       // ex: 22
    projets: StateFundedProject[];
  };
}

// ==========================================
// 3. REPRÉSENTATION ÉLECTORALE & ÉLUS
// ==========================================

export type PoliticalGroupCode =
  | 'RN' | 'EPR' | 'LFI' | 'SOC' | 'DR'
  | 'Dem' | 'EcoS' | 'HOR' | 'LIOT' | 'GDR' | 'UDR' | 'NI';

export interface PoliticalGroupMeta {
  code: PoliticalGroupCode;
  nomComplet: string;
  effectifSieges: number;
  couleurHex: string;
}

export interface DeputyProfile {
  id: string;
  prenom: string;
  nom: string;
  photoUrl: string;
  circonscriptionNumero: number;
  circonscriptionNom: string;   // ex: "1re circonscription de Seine-et-Marne"
  groupePolitique: {
    code: PoliticalGroupCode;
    nom: string;
    couleur: string;
  };
  commissionPermanente: string; // ex: "Commission des affaires culturelles et de l'éducation"
  mandatEnCoursDepuis: number;  // ex: 2024
  coordonneesAssemblee: {
    bureau: string;
    emailOfficiel: string;
    urlFicheAssemblee: string;
    rneCertifie: boolean;
  };
  bilanVotesSolennelsRecents: {
    totalObserves: number;      // ex: 3
    votesPour: number;          // ex: 0
    votesContre: number;        // ex: 1
    abstentions: number;        // ex: 2
  };
}

export interface MayorProfile {
  prenom: string;
  nom: string;
  mandatDebut: number;          // ex: 2020 ou 2023
  mandatFin: number;            // 2026
  profession?: string;          // ex: "Avocat au barreau"
  etiquetteNuance: string;      // ex: "Union du Centre · Horizons"
  nombreElusConseil: number;    // ex: 43
  nombreAdjoints: number;       // ex: 13
  dateProchainConseilMunicipal?: string; // ISO format
}

export interface SenatorProfile {
  id: string;
  prenom: string;
  nom: string;
  departement: string;          // ex: "Seine-et-Marne"
  groupePolitiqueSénat: string; // ex: "Les Républicains (REP)"
  commissionPermanente: string;
  urlFicheSenat: string;
}

export interface LocalRepresentativesRegistry {
  commune: MayorProfile;
  depute: DeputyProfile;
  senateursDepartement: SenatorProfile[];
  conseilDepartemental: {
    canton: string;
    elusBinome: Array<{ nom: string; role: string; parti: string }>;
  };
  conseilRegional: {
    region: string;
    presidente: string;
    conseillersDepartementauxEffectif: number;
  };
}

// ==========================================
// 4. ASSEMBLÉE NATIONALE & SCRUTINS PUBLICS
// ==========================================

export type VotePosition = 'Pour' | 'Contre' | 'Abstention' | 'NonVotant';

export interface GroupVoteBreakdown {
  groupeCode: PoliticalGroupCode;
  groupeNom: string;
  positionMajoritaire: VotePosition;
  totalVotants: number;
  decompte: {
    pour: number;
    contre: number;
    abstention: number;
    nonVotant: number;
  };
  membresNominatifs?: Array<{
    deputeId: string;
    nom: string;
    vote: VotePosition;
  }>;
}

export interface ScrutinPublic {
  id: string;                   // ex: "scrutin-1249"
  numeroScrutin: number;        // ex: 458
  legislature: number;          // 17
  dateSeance: string;           // "2026-11-04"
  titreOfficielTexte: string;   // ex: "Première partie du projet de loi de finances pour 2027"
  typeScrutin: 'Solennel' | 'Ordinaire';
  objetDescription: string;
  resultatGlobal: {
    adopte: boolean;
    pour: number;
    contre: number;
    abstentions: number;
  };
  voteDuDeputeLocal: {
    deputeId: string;
    position: VotePosition;
  };
  votesParGroupe: GroupVoteBreakdown[];
  sourceUrlAssemblee: string;
}

// ==========================================
// 5. CALENDRIER PARLEMENTAIRE & ÉVÉNEMENTS
// ==========================================

export interface ParliamentaryAgendaEvent {
  id: string;
  dateHeureDebut: string;       // ISO
  dateHeureFin: string;         // ISO
  institution: 'AssembleeNationale' | 'Senat' | 'ConseilMunicipal';
  lieu: string;                 // ex: "Hémicycle" ou "Salle A213"
  titre: string;                // ex: "Projet de loi de financement de la sécurité sociale (PLFSS 2027)"
  statutProcedure: 'Discussion generale' | 'Examen en commission' | 'Vote solennel';
  resumeTexte: string;
  urlDossierLegislatif?: string;
}

// ==========================================
// 6. GUIDE CIVIQUE « MA VOIX »
// ==========================================

export interface LegislativeStep {
  numero: number;               // 1 à 5
  titre: string;                // ex: "Dépôt & Saisine"
  acteurs: string;              // ex: "Gouvernement (Projet) ou Parlement (Proposition)"
  descriptionDetaillee: string;
  referenceJuridique?: string;  // ex: "Constitution de 1958 · Art. 39"
}

export interface CivicGuideArticle {
  id: string;
  categorie: 'Notion cle' | 'Action directe' | 'Dans les coulisses' | 'Budget local';
  titre: string;                // ex: "Projet vs Proposition de loi : quelle différence ?"
  tempsLectureMinutes: number;
  contenuMarkdown: string;
}
