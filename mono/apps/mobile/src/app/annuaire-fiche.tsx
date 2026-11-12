/* FICHE D'UN ELU DE L'ANNUAIRE : identite, fonction, lieu, debut de fonction, source.
 * Ouverte depuis l'onglet « Élus ». Député : groupe (table AMO30) et photo libre (D27),
 * joints par son identifiant de l'Assemblée. Pas de vote ici : les votes sont dans la fiche
 * « Qui décide », par commune. */
import { useBasSur } from "../ui/page";
import { ScrollView, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { dateFr } from "@repere/core";
import { Carte } from "../lib/composants";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Avatar, CreditPhoto } from "../ui/avatar";
import { BadgeGroupe } from "../ui/badge-groupe";
import { groupeDe, GROUPE_INCONNU, useGroupes } from "../lib/groupes";
import { usePhotoElu } from "../lib/photos";
import { PastilleSource } from "../ui/source";
import { DatePublication } from "../ui/fraicheur";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { Entree } from "../ui/entree";
import { ElusStory } from "../ui/partage/variantes/elu.story";
import { messageElu } from "../ui/partage/messages";
import type { Fiche } from "../types/annuaire";

type Params = Partial<Fiche>;

export default function AnnuaireFiche() {
  const p = useLocalSearchParams<Params>();
  const nom = p.nom || "Élu";
  const fonction = p.fonction || "";
  const lieu = p.lieu || "";
  const dateDebut = p.depuis ? dateFr(p.depuis) : "";
  const depuis = dateDebut ? `En fonction depuis le ${dateDebut}.` : "";
  const groupes = useGroupes();
  const photo = usePhotoElu(p.dep, p.ref);
  const groupe = groupeDe(p.ref || undefined, groupes);
  const manque = [
    !p.ref ? "Ni photo, ni groupe : les données publiées pour cette fonction ne les contiennent pas." : null,
    p.ref && groupe === GROUPE_INCONNU ? "Groupe politique : non publié dans la table de l'Assemblée relevée par Repère." : null,
    p.ref && !photo ? "Pas de photo : aucune image sous licence libre n'est rattachée à cet élu sur Wikimedia Commons." : null,
  ].filter(Boolean) as string[];
  const source = p.producteur ? `Source : ${p.producteur}${p.maj ? `, relevé le ${dateFr(p.maj)}` : ""}.` : "";
  const bas = useBasSur();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, paddingBottom: bas, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Élu" }} />
      <DatePublication />
      <Entree style={{ gap: PAS * 4 }}>
        <View style={{ alignItems: "center", gap: PAS * 3 }}>
          <Avatar nom={nom} taille={88} photo={photo} groupe={groupe} echelon={p.ref ? "france" : "region"} />
          <Text style={[TYPO.question, { textAlign: "center" }]} accessibilityRole="header">{nom}</Text>
          {p.fonction ? <Text style={[TYPO.corps, { textAlign: "center" }]}>{p.fonction}</Text> : null}
          {p.lieu ? <Text style={[TYPO.note, { textAlign: "center" }]}>{p.lieu}</Text> : null}
          {p.ref ? <BadgeGroupe groupe={groupe} /> : null}
        </View>
        <Carte titre="En fonction depuis">
          {p.depuis ? (
            <Text style={TYPO.corps}>Le {dateDebut}.</Text>
          ) : (
            <Text style={TYPO.note}>Date de début non publiée par la source. Repère ne la devine pas.</Text>
          )}
        </Carte>
        {/* 07/11/2026 : la phrase dit ce qui manque VRAIMENT pour cet élu (avant : « ni photo, ni
            parti » pour tous, faux depuis la table des groupes et les photos libres). */}
        {manque.length ? (
          <Carte titre="Ce que Repère n'affiche pas">
            <Text style={TYPO.note}>{manque.join(" ")}</Text>
          </Carte>
        ) : null}
        {photo ? <CreditPhoto photo={photo} /> : null}
        {p.producteur ? <PastilleSource source={{ producteur: p.producteur, licence: p.licence, maj: p.maj, url: p.url }} /> : null}
      </Entree>
      {p.producteur ? (
        <PartagerCarte etiquette="Partager cette fiche"
          repli={messageElu({ nom, fonction, lieu, depuis, producteur: p.producteur, lien: p.url || null })}
          rendu={ref => <ElusStory refCarte={ref} nom={nom} fonction={fonction} lieu={lieu} source={source} />} />
      ) : null}
    </ScrollView>
  );
}
