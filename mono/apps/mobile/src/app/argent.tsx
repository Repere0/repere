/* /argent DEVIENT /finances (décision du porteur, 16/11/2026, audit UI vague 2, tâche 6).
 * Le même écran vivait à deux adresses : l'onglet « Finances », et /argent empilé au-dessus de la
 * barre, avec un autre bouton retour. Il n'en reste qu'une, l'onglet. /argent reste une adresse
 * valide (liens déjà partagés, chemin du Repère du jour) : elle mène à l'onglet. */
import { Redirect } from "expo-router";

export default function VersFinances() {
  return <Redirect href="/finances" />;
}
