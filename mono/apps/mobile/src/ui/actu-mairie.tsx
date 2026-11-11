/* LA DERNIÈRE PUBLICATION DE LA MAIRIE, EN ACTUALITÉ (refonte « légère », 09/11/2026).
 * Lue dans le flux RSS officiel de la mairie (D81, ADR 0007) : titre, deux phrases au plus, date,
 * lien ; jamais l'article entier. La date est sur sa propre ligne, au-dessus du titre. Repère ne
 * dit pas « arrêté » : il ne sait pas quel acte la mairie publie, il dit « publié par la mairie ».
 * Sans flux pour la commune, rien n'est affiché ici (l'écran « Aujourd'hui » le dit, lui). */
import { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { ageReleve, dateFr } from "@repere/core";
import { actusFlux, chargerActuellesRss } from "../lib/donnees";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { aujourdhui } from "./cette-semaine-commune";

type Entree = { titre: string; resume?: string; date: string; lien: string };

export function ActuMairie({ insee, nom }: { insee: string; nom: string }) {
  const [x, setX] = useState<Entree | null>(null);
  useEffect(() => {
    let vivant = true;
    chargerActuellesRss().then(r => {
      const liste = actusFlux(r.donnees, insee, aujourdhui()) as Entree[];
      if (vivant) setX(liste.length ? liste[0] : null);
    }).catch(() => {});
    return () => { vivant = false; };
  }, [insee]);
  if (!x) return null;
  const age = ageReleve(x.date);
  return (
    <View style={{ gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
      <Text style={TYPO.etiquette}>Publié par la mairie de {nom}</Text>
      <Text style={[TYPO.donnee, { color: couleurs.sourd }]}>{dateFr(x.date)}{age !== null && age >= 0 ? ` · il y a ${age} jour${age > 1 ? "s" : ""}` : ""}</Text>
      <Text style={[TYPO.reponse]}>{x.titre}</Text>
      {x.resume ? <Text style={TYPO.note} numberOfLines={3}>{x.resume}</Text> : null}
      <Pressable onPress={() => Linking.openURL(x.lien)} accessibilityRole="link"
        accessibilityLabel={`Lire sur le site de la mairie de ${nom}, ouvre un site externe`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.corps, { fontFamily: POLICE.texteMoyen, color: couleurs.lien }]}>Lire sur le site de la mairie ↗</Text>
      </Pressable>
      <Text style={TYPO.micro}>Flux RSS officiel de la mairie, lu automatiquement.</Text>
    </View>
  );
}
