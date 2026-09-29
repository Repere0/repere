/* UN PROJET FINANCE DANS VOTRE COMMUNE — le plus recent des projets que
 * l'Etat a soutenus (DGCL), meme choix et meme phrase que le site.
 * Deux absences distinctes : le fichier n'est pas arrive, ou la source ne
 * porte aucun projet pour cette commune. */
import { noteRattachement, phraseProjetLocal, DGCL_URL } from "@repere/core";
import { Carte, Source, Texte, Vide } from "../lib/composants";
import type { Ouvert } from "../lib/useCommune";


export function CarteProjet({ d, lu, onReessayer }: { d: Ouvert; lu: boolean; onReessayer: () => void }) {
  const projet = d.dernierProjet;
  return (
    <Carte echelon="ville" titre="Un projet financé dans votre commune">
      {!lu ? (
        <Vide titre="Les projets financés par l'État ne sont pas arrivés jusqu'ici."
          corps="Le fichier existe, il n'a pas pu être chargé. Ce n'est pas une absence de projet."
          action="Réessayer" onAction={onReessayer} />
      ) : projet ? (
        <>
          <Texte fort>{projet.p.intitule}</Texte>
          <Texte>{phraseProjetLocal(projet.p, d.nomCommune)}</Texte>
          {noteRattachement(projet.p) ? <Texte sourd>{noteRattachement(projet.p)}</Texte> : null}
          {d.srcProjets ? <Source producteur={d.srcProjets.producteur} licence={d.srcProjets.licence} maj={d.srcProjets.mis_a_jour_le} url={d.srcProjets.url} /> : null}
        </>
      ) : (
        <Vide titre={`Aucun projet financé par l'État n'est publié pour ${d.nomCommune} sur les exercices relevés.`}
          corps="La source ne couvre que les dotations d'investissement de l'État : une commune finance aussi des projets par elle-même."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      )}
    </Carte>
  );
}
