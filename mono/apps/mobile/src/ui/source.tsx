/* LA SOURCE, COUCHE SECONDAIRE TOUJOURS A PORTEE — spike du 30/09/2026.
 *
 * « Aucun affichage sans source » ne veut pas dire « la source en gros
 * partout ». A l'ecran : un simple « ⓘ Source » a cote de l'information, en
 * petit, sans fond ; « ⓘ Calculé par Repère · source » quand le chiffre
 * est un calcul (invariant 4 : le calcul se voit sans ouvrir la feuille).
 * Un geste ouvre la feuille :
 *   D'ou vient cette information ?  -> le producteur, en clair
 *   Donnees publiees le …           -> la date (ou « relevees le » pour les
 *                                      fichiers de l'Assemblee et du Senat)
 *   Comment Repere l'utilise        -> une phrase ; la methode si c'est un calcul
 *   Voir la donnee originale ↗      -> le lien officiel
 *   Details                         -> la ligne complete du site (licence…),
 *                                      pour qui veut aller jusqu'au bout.
 * Le lecteur d'ecran entend le producteur et la date sans ouvrir la feuille. */
import { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CALCUL_REPERE, dateFr, datePublication, ligneSource } from "@repere/core";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../lib/theme";
import { Etiquette } from "./resume";

export type InfoSource = {
  producteur?: string; licence?: string; maj?: string; mention?: string; url?: string;
  /* date de releve (fichiers de l'Assemblee, du Senat) : ce n'est pas une date de mise a jour */
  releve?: string;
  /* nom court, quand le nom complet ne se resume pas seul */
  court?: string;
  /* present si le chiffre est un calcul de Repere : la methode, en une phrase */
  methode?: string;
  /* comment Repere utilise la donnee, quand ce n'est pas un calcul */
  usage?: string;
  /* texte du lien vers la donnee originale (ex. « Scrutin n° 8430 sur le site de l'Assemblée ») */
  lienTexte?: string;
};

/* « Observatoire des finances et de la gestion publique locales (OFGL) » -> « OFGL » */
export function producteurCourt(p?: string): string {
  const m = /\(([A-ZÉ]{2,8})\)\s*$/.exec(p || "");
  if (m) return m[1];
  const nom = (p || "Source").split(" — ")[0];
  if (nom.length <= 26) return nom;
  return nom.split(/\s+/).filter(w => w.length > 3).map(w => w[0].toUpperCase()).join("");
}

const dateDite = (s: InfoSource) =>
  s.maj ? `Données publiées le ${dateFr(s.maj)}` : s.releve ? `Données relevées le ${dateFr(s.releve)}` : null;

/* `quoi` : quand une reponse s'appuie sur deux sources (« des comptes », « des élus »). */
/* `court` : sur l'accueil, ou la pastille partage une ligne avec la question suivante ;
   `nom` y remplace « Source » quand une reponse en a deux (« ⓘ Comptes », « ⓘ Élus »). */
export function PastilleSource({ source, quoi, court, nom }: { source: InfoSource | null | undefined; quoi?: string; court?: boolean; nom?: string }) {
  const [ouverte, setOuverte] = useState(false);
  if (!source || !source.producteur) return null;
  const date = dateDite(source);
  return (
    <>
      {/* Zone tactile de 48 px, texte discret. */}
      <Pressable
        onPress={() => setOuverte(true)}
        accessibilityRole="button"
        accessibilityLabel={`D'où vient cette information ? ${source.methode ? "Calcul de Repère à partir de données de " : ""}${source.producteur}${date ? ". " + date : ""}`}
        style={({ pressed }) => [s.zone, pressed && { opacity: 0.5 }]}
      >
        {/* Invariant 4 : un calcul se dit calcul, a l'oeil aussi, pas seulement
            au lecteur d'ecran ni derriere un geste. */}
        <Text style={s.lien}>{source.methode ? (court ? "ⓘ Calcul Repère" : "ⓘ Calculé par Repère · source") : `ⓘ ${nom || "Source"}`}{quoi ? " " + quoi : ""}</Text>
      </Pressable>
      <FeuilleSource source={source} visible={ouverte} onFermer={() => setOuverte(false)} />
    </>
  );
}

export function FeuilleSource({ source, visible, onFermer }: { source: InfoSource; visible: boolean; onFermer: () => void }) {
  const marges = useSafeAreaInsets();
  const date = dateDite(source);
  /* DEUX DATES, JAMAIS CONFONDUES (30/09/2026) : celle de la source (publiee
     ou relevee) et celle ou Repere a traite les fichiers. */
  const { r } = useCommuneChoisie();
  const traite = r.pret ? datePublication(r.index) : null;
  const detail = ligneSource(source.releve && !source.mention ? { ...source, mention: "relevé le " + dateFr(source.releve) } : source);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      <ScrollView style={{ backgroundColor: couleurs.sol }} contentContainerStyle={[s.feuille, { paddingBottom: marges.bottom + PAS * 8 }]}>
        <Etiquette emoji="🔎" texte="D'où vient cette information ?" />
        <Text style={TYPO.question} accessibilityRole="header">{source.producteur}</Text>
        {date ? <Text style={[TYPO.corps, { fontWeight: "600" }]}>{date}</Text> : null}
        {traite ? <Text style={TYPO.note}>Traitées par Repère le {dateFr(traite)}</Text> : null}

        <View style={s.bloc}>
          <Text style={TYPO.etiquette}>Comment Repère l'utilise</Text>
          {source.methode ? (
            <>
              <Text style={TYPO.corps}>{source.methode}</Text>
              <Text style={[TYPO.note, { fontWeight: "700" }]}>{CALCUL_REPERE}</Text>
            </>
          ) : (
            <Text style={TYPO.corps}>{source.usage || "Repère affiche ce chiffre tel que la source le publie, sans le modifier."}</Text>
          )}
        </View>

        {source.url ? (
          <Pressable onPress={() => Linking.openURL(source.url as string)} accessibilityRole="link"
            accessibilityLabel={`${source.lienTexte || "Voir la donnée originale"}, ouvre un site externe`}
            style={({ pressed }) => [s.bouton, pressed && { opacity: 0.7 }]}>
            <Text style={s.boutonTexte}>{source.lienTexte || "Voir la donnée originale"} ↗</Text>
          </Pressable>
        ) : null}

        <View style={{ gap: PAS }}>
          <Text style={TYPO.etiquette}>Détails</Text>
          <Text style={TYPO.micro}>{detail}</Text>
        </View>

        <Pressable onPress={onFermer} accessibilityRole="button" style={({ pressed }) => [s.fermer, pressed && { opacity: 0.6 }]}>
          <Text style={[TYPO.corps, { fontWeight: "600" }]}>Fermer</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const s = StyleSheet.create({
  zone: { alignSelf: "flex-start", minHeight: CIBLE, justifyContent: "center", paddingRight: PAS * 3 },
  lien: { fontSize: 14, fontWeight: "600", color: couleurs.sourd },
  feuille: { padding: PAS * 6, gap: PAS * 5 },
  bloc: { gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte },
  bouton: { minHeight: CIBLE + 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.ville, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4 },
  boutonTexte: { color: couleurs.blanc, fontSize: 17, fontWeight: "700", textAlign: "center" },
  fermer: { minHeight: CIBLE, alignItems: "center", justifyContent: "center" },
});
