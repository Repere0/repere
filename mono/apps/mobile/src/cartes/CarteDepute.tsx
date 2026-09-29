/* VOTRE DEPUTE, ET SON DERNIER VOTE EXPLIQUE — meme vote que l'ecran
 * « Aujourd'hui » du site (deriverAujourdhui), memes phrases que LigneVote.
 * Quatre absences, quatre phrases : fichiers pas arrives, releves qui ne se
 * correspondent pas, circonscription inconnue, position non portee. */
import { Text } from "react-native";
import { dateFr, decompte, MOTS, ordinal, procedure, REFUS_APPARIEMENT, titreLisible } from "@repere/core";
import { Carte, LienSortant, Source, Texte, Vide } from "../lib/composants";
import type { Ouvert } from "../lib/useCommune";

const RESULTAT = (x: string) => (x === "adopté" ? "adopté" : x === "rejeté" ? "rejeté" : x);
const NON_PORTEE = "Une position non portée n'est pas une absence : elle peut couvrir une délégation de vote, une présidence de séance, ou un scrutin auquel le député n'a pas été appelé. Repère n'en déduit rien.";
const SCRUTINS_AN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";

type Props = { d: Ouvert; lus: boolean; fiables: boolean; onReessayer: () => void };

export function CarteDepute({ d, lus, fiables, onReessayer }: Props) {
  const vote = d.dernierVote;
  const mot = vote ? (MOTS as Record<string, string>)[vote.position] : undefined;
  const proc = vote ? procedure(vote.sc.t) : "";
  return (
    <Carte echelon="france" titre="Votre député, à l'Assemblée nationale">
      {!lus ? (
        <Vide titre="Les votes de l'Assemblée ne sont pas arrivés jusqu'ici."
          corps="Les fichiers existent, ils n'ont pas pu être chargés. Ce n'est pas une absence de vote."
          action="Réessayer" onAction={onReessayer} />
      ) : vote ? (
        <>
          <Texte sourd>
            {d.nbCircos > 1
              ? `${d.nomCommune} est partagée entre ${d.nbCircos} circonscriptions. Vote du député élu dans la ${ordinal(vote.circo)} :`
              : `Vote du député élu dans votre circonscription (${ordinal(vote.circo)} circonscription${d.nomDep ? " — " + d.nomDep : ""}), à l'Assemblée nationale :`}
          </Texte>
          <Texte fort>{titreLisible(vote.sc.t)}</Texte>
          <Texte>
            {mot
              ? <>{vote.qui || "Votre député"} a voté <Text style={{ fontWeight: "700" }}>{mot === "Abstention" ? "l'abstention" : mot.toLowerCase()}</Text>.</>
              : <>{vote.qui || "Votre député"} : le relevé de l'Assemblée ne porte pas de position sur ce scrutin.</>}
          </Texte>
          <Texte sourd>
            Texte {RESULTAT(vote.sc.s)} le {dateFr(vote.sc.d)}{proc ? " · " + proc : ""}{vote.sc.dec ? " · " + decompte(vote.sc.dec) : ""}.
          </Texte>
          {!mot ? <Texte sourd>{NON_PORTEE}</Texte> : null}
          {d.base ? <LienSortant url={d.base + vote.sc.n} texte={`Scrutin n° ${vote.sc.n} sur le site de l'Assemblée`} /> : null}
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
          corps={NON_PORTEE} lien={{ texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN }} />
      )}
    </Carte>
  );
}
