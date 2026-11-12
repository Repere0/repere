/* RETENIR LA COMMUNE SUR CE TELEPHONE — 29/09/2026 (D-M3).
 * Le lecteur le demande, ou rien n'est garde. Il peut l'oublier d'un geste.
 * Ce que dit l'ecran est ce que fait le code (lib/memoire.ts) : deux codes
 * publics dans le cache de l'application, exclu des sauvegardes, jamais
 * envoyes. */
import { useState } from "react";
import { Bouton, Carte, Texte } from "../lib/composants";
import { useSelection, type Choix } from "../lib/selection";

export function CarteMemoire({ choix }: { choix: NonNullable<Choix> }) {
  const { retenue, retenir, oublier } = useSelection();
  const [refus, setRefus] = useState(false);
  const ici = !!retenue && retenue.c === choix.insee;
  return (
    <Carte titre="Sur cet appareil">
      {ici ? (
        <>
          <Texte>{choix.nom} est retenue sur cet appareil : Repère vous la proposera à la prochaine ouverture.</Texte>
          <Texte sourd>Seul cet appareil la garde. Rien n'est envoyé, rien n'est sauvegardé ailleurs.</Texte>
          <Bouton texte={`Oublier ${choix.nom}`} discret onPress={() => { setRefus(false); oublier(); }} />
        </>
      ) : (
        <>
          <Texte sourd>
            Repère peut garder {choix.nom} sur cet appareil pour vous la proposer à la prochaine ouverture.
            Seul cet appareil la garde : rien n'est envoyé, aucun compte n'est créé.
          </Texte>
          {refus ? <Texte>Ce téléphone n'a pas permis de l'enregistrer. Vous pourrez la retaper à la prochaine ouverture.</Texte> : null}
          <Bouton texte={`Retenir ${choix.nom} sur cet appareil`} onPress={() => setRefus(!retenir(choix))} />
        </>
      )}
    </Carte>
  );
}
