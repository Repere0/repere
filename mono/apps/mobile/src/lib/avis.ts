/* MODE DÉMO ET AVIS DES LECTEURS (17/11/2026, porteur : démonstration publique avant la sortie).
 *
 * Deux réglages de build, aucun serveur (invariant 1), rien de stocké (invariant 2) :
 *   - EXPO_PUBLIC_APP_MODE=demo : un bandeau discret dit que c'est une version de démonstration ;
 *   - EXPO_PUBLIC_FEEDBACK_EMAIL (à défaut EXPO_PUBLIC_CONTACT_EMAIL) : l'adresse qui reçoit les avis.
 *     Sans adresse, aucun bouton « Laisser un avis » : pas de bouton mort, pas d'adresse inventée.
 * L'avis part par la messagerie du lecteur (mailto:). Le message est pré-rempli avec ce que le lecteur voit
 * de son appareil : version de Repère, date, plateforme et navigateur. Il peut tout effacer avant d'envoyer.
 * Fonctions pures : éprouvées par tests/avis.test.mjs. */

export const MODE_DEMO = process.env.EXPO_PUBLIC_APP_MODE === "demo";
const ADRESSE = process.env.EXPO_PUBLIC_FEEDBACK_EMAIL || process.env.EXPO_PUBLIC_CONTACT_EMAIL || "";
const COURRIEL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const COURRIEL_AVIS: string | null = COURRIEL.test(ADRESSE) ? ADRESSE : null;

export type Systeme = { version: string; date: Date; plateforme: string; navigateur?: string | null };

export function corpsAvis(s: Systeme): string {
  const jour = s.date.toISOString().slice(0, 10);
  return [
    "Mon avis sur Repère :",
    "",
    "",
    "Ce que je faisais :",
    "",
    "",
    "---",
    "Informations techniques (vous pouvez les effacer) :",
    `Version : ${s.version}`,
    `Date : ${jour}`,
    `Plateforme : ${s.plateforme}`,
    s.navigateur ? `Navigateur : ${s.navigateur}` : null,
  ].filter(l => l !== null).join("\n");
}

export function lienAvis(adresse: string, s: Systeme): string {
  return `mailto:${adresse}?subject=${encodeURIComponent(`Avis sur Repère ${s.version}`)}&body=${encodeURIComponent(corpsAvis(s))}`;
}
