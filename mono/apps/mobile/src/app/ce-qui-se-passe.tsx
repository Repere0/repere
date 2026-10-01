/* « CE QUI SE PASSE » — LES FAITS RELUS PAR UN HUMAIN (mission UX du 01/10/2026).
 *
 * L'application n'avait aucun ecran pour le fil, alors que des faits valides
 * existent (data/evenements/*.md, `valide: true` pose a la main, publies par
 * outils/evenements.py). Chaque fait est un objet d'information, pas un lien :
 *   QUAND  la date du fait ;
 *   QUI    qui a decide — seulement si celui qui publie est celui qui decide
 *          (quiADecide, @repere/core) ; sinon rien, jamais un nom devine ;
 *   QUOI   le titre, ecrit par la redaction ;
 *   OU     « toute la France » ou la commune ;
 *   CE QUE CA CHANGE  la partie ecrite par un humain, telle quelle ;
 *   SOURCE l'acte officiel.
 * Le libelle n'est PAS « pourquoi cela vous concerne » : Repere ne sait pas
 * ce qui concerne chaque lecteur ; il dit ce que le texte change, comme l'a
 * ecrit la personne qui l'a relu.
 *
 * Ordre : le temps, et rien d'autre (invariant 3). « A confirmer » est dit
 * quand la redaction l'a marque ainsi : jamais transforme en « verifie ».
 * Le fichier est charge ici seulement : l'accueil n'attend pas le fil. */
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { dateFr, faitsDuFil, partieDuFait, quiADecide } from "@repere/core";
import type { Evenements, Fait } from "@repere/core/domaine";
import { Bouton, Carte, Vide } from "../lib/composants";
import { chargerEvenements, ETATS } from "../lib/donnees";
import { useSelection } from "../lib/selection";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Etiquette } from "../ui/resume";
import { Depli } from "../ui/visuels";

const VISIBLES = 3;
const FIL_PAS_ARRIVE = {
  titre: "Les faits relus par Repère ne sont pas arrivés jusqu'à cet appareil.",
  corps: "Ils sont republiés à chaque mise à jour de Repère ; ils n'ont pas pu être chargés cette fois-ci.",
};
const FIL_VIDE = {
  titre: "Aucun fait relu n'est encore publié pour votre commune ou pour toute la France.",
  corps: "Chaque fait du fil est relu et validé par une personne avant d'être publié : le fil ne se remplit pas automatiquement.",
};

function ObjetFait({ e, nomCommune }: { e: Fait; nomCommune: string }) {
  const qui = quiADecide(e);
  /* Le titre dit deja qui (« Le Conseil constitutionnel a declare… ») : on ne
     le repete pas au-dessus. */
  const quiDejaDit = !!qui && e.t.toLowerCase().includes(qui.replace(/^(Le |La |L')/, "").toLowerCase());
  const change = (e.axes || "").replace(/\s*\n\s*/g, " ").trim() || partieDuFait(e, "Ce que ça change");
  const detail = partieDuFait(e, "Le fait");
  const ou = e.e === "france" ? "Toute la France" : nomCommune;
  return (
    <Carte echelon={e.e === "france" ? "france" : "ville"} titre={`${dateFr(e.d)} · ${ou}`}>
      <View style={{ gap: PAS * 3 }}>
        {qui && !quiDejaDit ? <Etiquette texte={`Qui a décidé : ${qui}`} /> : null}
        <Text style={TYPO.reponse} accessibilityRole="header">{e.t}</Text>
        {e.conf && e.conf !== "verifie" ? (
          <Text style={[TYPO.note, { fontWeight: "700", color: couleurs.encre }]}>À confirmer : relevé, en attente de confirmation par la rédaction.</Text>
        ) : null}
        {change ? (
          <View style={{ gap: PAS }}>
            <Text style={[TYPO.corps, { fontWeight: "700" }]}>Ce que ça change</Text>
            <Text style={TYPO.corps}>{change}</Text>
          </View>
        ) : null}
        {detail ? <Depli titre="Le fait en détail"><Text style={TYPO.corps}>{detail}</Text></Depli> : null}
        <PastilleSource source={{ producteur: e.srcn, url: e.src, usage: "L'acte officiel dont ce fait est tiré. Le titre et « ce que ça change » sont écrits et relus par une personne." }} />
      </View>
    </Carte>
  );
}

export default function CeQuiSePasse() {
  const { choix } = useSelection();
  const [etat, setEtat] = useState<{ etat: string; donnees: Evenements | null }>({ etat: ETATS.EN_COURS, donnees: null });
  const [essai, setEssai] = useState(0);
  /* Les trois plus recents d'abord ; les autres sur demande (divulgation
     progressive : un fil de huit cartes faisait huit ecrans). */
  const [tout, setTout] = useState(false);
  useEffect(() => {
    let vivant = true;
    setEtat({ etat: ETATS.EN_COURS, donnees: null });
    chargerEvenements().then(r => { if (vivant) setEtat({ etat: r.etat, donnees: r.donnees as Evenements | null }); })
      .catch(() => { if (vivant) setEtat({ etat: ETATS.ECHEC, donnees: null }); });
    return () => { vivant = false; };
  }, [essai]);
  return (
    <AvecDonnees rendu={r => {
      const fil = etat.donnees ? faitsDuFil(etat.donnees, { dep: r.d.dep, commune: choix ? choix.insee : "" }) as Fait[] : [];
      return (
        <Page>
          <Stack.Screen options={{ title: "Ce qui se passe" }} />
          <Question etiquette="Ce qui se passe" question="Qu'est-ce qui a été décidé ?"
            sous="Des décisions publiques, chacune relue par une personne, du plus récent au plus ancien." />
          {etat.etat === ETATS.EN_COURS ? (
            <Text style={TYPO.note}>Chargement des faits…</Text>
          ) : etat.etat !== ETATS.SERVI ? (
            <Vide {...FIL_PAS_ARRIVE} action="Réessayer" onAction={() => setEssai(n => n + 1)} />
          ) : !fil.length ? (
            <Vide {...FIL_VIDE} />
          ) : (
            <>
              {(tout ? fil : fil.slice(0, VISIBLES)).map(e => <ObjetFait key={e.id} e={e} nomCommune={r.d.nomCommune} />)}
              {!tout && fil.length > VISIBLES ? (
                <Bouton texte={`Voir les ${fil.length - VISIBLES} faits plus anciens`} onPress={() => setTout(true)} discret />
              ) : null}
              <Text style={TYPO.micro}>Mis à jour par Repère le {dateFr(etat.donnees!.maj)}. Repère ne trie les faits que par leur date.</Text>
            </>
          )}
        </Page>
      );
    }} />
  );
}
