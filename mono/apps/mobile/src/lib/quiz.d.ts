export type EntreeQuiz = { cle: string; titre: string; corps: string; categorie?: string };
export type Proposition = { cle: string; titre: string; texte: string; juste: boolean };
export type QuestionQuiz = { cle: string; titre: string; enonce: string; propositions: Proposition[]; explication: string };
export function melanger<T>(liste: T[], hasard?: () => number): T[];
export function definitionCourte(corps: string): string;
export function entreesDuQuiz(entrees: EntreeQuiz[]): EntreeQuiz[];
export function construireQuestion(entrees: EntreeQuiz[], cle: string, hasard?: () => number): QuestionQuiz | null;
export function sessionDuQuiz(entrees: EntreeQuiz[], hasard?: () => number): QuestionQuiz[];
