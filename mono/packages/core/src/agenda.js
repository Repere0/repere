/* AJOUTER UNE SEANCE AU CALENDRIER DU TELEPHONE (beta, 13/10/2026).
 *
 * Repere calcule les donnees d'un evenement ; l'application les remet au
 * calendrier du lecteur, apres son autorisation. Repere ne retient rien.
 *
 * Doctrine :
 *   - l'heure vient de la source : heure de Paris, convertie en instant ;
 *   - une fin publiee est recopiee ; une fin absente n'est jamais devinee, et
 *     les notes le disent ;
 *   - une seance sans heure n'est pas ajoutee (une heure inventee serait fausse) ;
 *   - la source, sa date et son lien sont dans les notes, comme sur l'ecran.
 *
 * Les dates d'agenda sont en heure de Paris SANS fuseau (« 2026-10-13T15:00 »).
 * Regle d'ete europeenne (directive 2000/84/CE) : l'heure d'ete court du dernier
 * dimanche de mars, 01:00 UTC, au dernier dimanche d'octobre, 01:00 UTC. */
import { dateFr } from "./format.js";

/* Dernier dimanche du mois (mois de 0 a 11), a 01:00 UTC, en millisecondes. */
function dernierDimanche(annee, mois) {
  const dernier = new Date(Date.UTC(annee, mois + 1, 0));
  return Date.UTC(annee, mois, dernier.getUTCDate() - dernier.getUTCDay(), 1);
}

/* Heure de Paris sans fuseau -> instant, en millisecondes depuis l'epoque UTC. */
export function instantParis(naif) {
  const [date, heure] = String(naif).split("T");
  const [annee, mois, jour] = date.split("-").map(Number);
  const [heures, minutes] = heure.split(":").map(Number);
  const local = Date.UTC(annee, mois - 1, jour, heures, minutes);
  const ete = local - 2 * 3600e3 >= dernierDimanche(annee, 2) && local - 2 * 3600e3 < dernierDimanche(annee, 9);
  return local - (ete ? 2 : 1) * 3600e3;
}

/* Les evenements d'un groupe de seances (une ligne du calendrier), prets a etre
   remis au calendrier du telephone. Une entree par heure de debut. */
export function seancesAgenda(g) {
  const src = g.source || {};
  const seances = [];
  g.debuts.forEach((debut, i) => {
    if (!debut || !String(debut).includes("T")) return;
    const finBrute = g.fins && g.fins[i];
    const finPubliee = !!finBrute && String(finBrute) >= String(debut);
    const notes = [
      g.categorie || null,
      g.points && g.points.length ? "Ordre du jour : " + g.points.join(" ; ") : null,
      src.producteur ? `Source : ${src.producteur}` : null,
      src.releve_le ? `relevé le ${dateFr(src.releve_le)}` : null,
      src.url ? `Lien : ${src.url}` : null,
      finPubliee ? null : "Fin non publiée par la source",
      "Vérifiez l'horaire sur le site officiel avant de vous déplacer",
    ].filter(Boolean).join(". ");
    seances.push({
      titre: g.titre,
      producteur: src.producteur || null,
      debut: new Date(instantParis(debut)),
      fin: finPubliee ? new Date(instantParis(finBrute)) : null,
      finPubliee,
      lieu: g.lieu || null,
      url: src.url || null,
      notes,
    });
  });
  return seances;
}
