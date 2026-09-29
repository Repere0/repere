/* VOTRE DEPUTE, ET SON DERNIER VOTE EXPLIQUE — meme vote que l'ecran
 * « Aujourd'hui » du site (deriverAujourdhui), memes phrases que LigneVote.
 * Quatre absences, quatre phrases : fichiers pas arrives, releves qui ne se
 * correspondent pas, circonscription inconnue, position non portee. */
import {
  lienScrutin, ligneScrutin, MOTS, phraseCirconscription, phrasePosition, POSITION_NON_PORTEE,
  REFUS_APPARIEMENT, dateFr, titreLisible,
} from "@repere/core";
import { Carte, LienSortant, Segments, Source, Texte, Vide } from "../lib/composants";
import type { Ouvert } from "../lib/useCommune";

/* Toutes les phrases du vote viennent de @repere/core (phrases.js) : le site
   (LigneVote, Aujourdhui) ecrit les memes, mot pour mot. */
const SCRUTINS_AN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";

type Props = { d: Ouvert; lus: boolean; fiables: boolean; onReessayer: () => void };

export function CarteDepute({ d, lus, fiables, onReessayer }: Props) {
  const vote = d.dernierVote;
  const mot = vote ? (MOTS as Record<string, string>)[vote.position] : undefined;
  const lien = vote && d.base ? lienScrutin(d.base, vote.sc) : null;
  return (
    <Carte echelon="france" titre="Votre député, à l'Assemblée nationale">
      {!lus ? (
        <Vide titre="Les votes de l'Assemblée ne sont pas arrivés jusqu'ici."
          corps="Les fichiers existent, ils n'ont pas pu être chargés. Ce n'est pas une absence de vote."
          action="Réessayer" onAction={onReessayer} />
      ) : vote ? (
        <>
          <Texte sourd>{phraseCirconscription(d, vote.circo)}</Texte>
          <Texte fort>{titreLisible(vote.sc.t)}</Texte>
          <Texte><Segments s={phrasePosition(vote.position, vote.qui)} /></Texte>
          <Texte sourd>{ligneScrutin(vote.sc)}</Texte>
          {!mot ? <Texte sourd>{POSITION_NON_PORTEE}</Texte> : null}
          {lien ? <LienSortant url={lien.url} texte={lien.texte} /> : null}
          {d.srcScrutins ? <Source producteur={d.srcScrutins.producteur} licence={d.srcScrutins.licence} url={d.srcScrutins.url}
            mention={d.srcScrutins.releve_le ? "relevé le " + dateFr(d.srcScrutins.releve_le) : undefined} /> : null}
        </>
      ) : !fiables ? (
        <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
      ) : d.nbCircos === 0 ? (
        <Vide titre={`Repère ne connaît pas la circonscription de ${d.nomCommune}.`}
          corps="La commune est absente de la table du ministère de l'Intérieur, souvent parce qu'elle a été créée après son dernier découpage. Repère ne devine pas." />
      ) : (
        <Vide titre="Aucun vote solennel de votre député n'est porté par le relevé de l'Assemblée."
          corps={POSITION_NON_PORTEE} lien={{ texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN }} />
      )}
    </Carte>
  );
}
