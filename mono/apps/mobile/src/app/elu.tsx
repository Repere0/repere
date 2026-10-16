/* « FICHE D'UN ÉLU » — le canevas Fiche, en donnees reelles (13/10/2026).
 *
 * Ouvert par le nom de la personne, depuis la chaine « Qui décide ». Chaque nom
 * de la chaine ouvre cette fiche : c'est la regle du porteur (13/10/2026).
 *
 * LE CANEVAS MONTRE : une identite, une phrase sur le parti, trois onglets
 * (Aperçu, Votes, Parcours), les sources au bas de la fiche, et un partage.
 *
 * CE QUI EST AFFICHE, ET CE QUI NE L'EST PAS.
 *   - Le nom, le role et l'institution : ce que la source du niveau donne.
 *   - Le parti : « non publié par la source » tant que la source ne le donne pas.
 *     Repère ne le devine jamais, et le canevas n'affiche pas d'exemple.
 *   - Ce que ce niveau decide : la meme phrase que « Qui décide » (@repere/core).
 *   - Votes : seulement pour un depute, et seulement le dernier vote publie.
 *     Une fonction qui ne vote pas au Parlement le dit.
 *   - Patrimoine, presence ou absence aux seances : jamais (invariant 8).
 * Une fiche n'affiche que des faits de mandat, sources. */
import { useState } from "react";
import { Animated, Pressable, Share, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { chaineDecision, dateFr, LIBELLES, titreLisible } from "@repere/core";
import { Carte } from "../lib/composants";
import { srcElus } from "../lib/sources";
import { couleurs, CIBLE, PAS, TYPO, type Echelon } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { useApparition } from "../ui/mouvement";
import { IconePartage } from "../ui/icones";

type Params = { nom?: string; role?: string; echelon?: string; niveau?: string; institution?: string; lieu?: string };
type Onglet = "apercu" | "votes" | "parcours";

const PARTI_NON_PUBLIE = "Parti : non publié par la source. Repère ne le déduit pas.";
const POSITION: Record<string, string> = { p: "Pour", c: "Contre", a: "Abstention" };

function Initiales({ nom }: { nom: string }) {
  const lettres = nom.split(/\s+/).filter(Boolean).map(m => m[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View accessible={false}
      style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: couleurs.encre, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 26 }}>{lettres}</Text>
    </View>
  );
}

/* Trois onglets, en une seule pastille, comme sur le canevas. */
function Onglets({ actif, choisir, votes }: { actif: Onglet; choisir: (o: Onglet) => void; votes: boolean }) {
  const liste: { cle: Onglet; t: string }[] = [{ cle: "apercu", t: "Aperçu" }, { cle: "votes", t: "Votes" }, { cle: "parcours", t: "Parcours" }];
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 999, backgroundColor: couleurs.trait }}>
      {liste.map(o => {
        const on = actif === o.cle;
        return (
          <Pressable key={o.cle} onPress={() => choisir(o.cle)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            accessibilityLabel={`${o.t}${o.cle === "votes" && !votes ? " (cette fonction ne vote pas)" : ""}`}
            style={{ flex: 1, minHeight: 40, borderRadius: 999, backgroundColor: on ? couleurs.carte : "transparent", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontWeight: on ? "800" : "600", color: couleurs.encre }}>{o.t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Elu() {
  const p = useLocalSearchParams<Params>();
  const nom = p.nom || "Élu";
  const echelon = p.echelon || "";
  const apparition = useApparition(0);
  const [onglet, setOnglet] = useState<Onglet>("apercu");
  return (
    <AvecDonnees rendu={r => {
      const niveaux = chaineDecision({ fiche: r.d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: r.d.dep });
      const decide = (niveaux as { echelon: string; decide?: string }[]).find(n => n.echelon === echelon)?.decide;
      const depute = echelon === "france";
      const vote = depute ? r.d.dernierVote as { sc: { t: string; d: string }; position?: string } | undefined : undefined;
      const libelleRole = [p.role, p.lieu].filter(Boolean).join(" · ");
      const partager = () => Share.share({
        message: `${nom}${libelleRole ? `, ${libelleRole}` : ""}.${p.institution ? ` ${p.institution}.` : ""}\nRésumé Repère, à partir des données publiées. Le détail est dans l'application.`,
      });

      return (
        <Page>
          <Stack.Screen options={{ title: "Fiche" }} />
          <Animated.View style={{ opacity: apparition, gap: PAS * 4 }}>
            {/* Le partage seul (16/10/2026) : le lien « Retour » doublait le retour de la
                barre haute, qui ramene deja a « Qui décide ». */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
              <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel="Partager la fiche"
                style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, opacity: pressed ? 0.6 : 1 })}>
                <IconePartage couleur={couleurs.encre} />
                <Text style={{ color: couleurs.encre, fontWeight: "700", fontSize: 15 }}>Partager</Text>
              </Pressable>
            </View>

            {/* Identite */}
            <View style={{ flexDirection: "row", gap: PAS * 4, alignItems: "center" }}>
              <Initiales nom={nom} />
              <View style={{ flex: 1, gap: 6 }}>
                <Question etiquette={p.niveau || LIBELLES.qui} question={nom} sous={libelleRole || undefined} />
              </View>
            </View>

            {/* Parti : une phrase vraie tant que la source ne le publie pas. */}
            <Text style={TYPO.note}>{PARTI_NON_PUBLIE}</Text>

            <Onglets actif={onglet} choisir={setOnglet} votes={depute} />

            {onglet === "apercu" ? (
              <View style={{ gap: PAS * 3 }}>
                <Carte echelon={echelon as Echelon} titre="Fonction">
                  {p.institution ? <Text style={TYPO.corps}>{p.institution}</Text> : null}
                  {p.lieu ? <Text style={TYPO.note}>{p.lieu}</Text> : null}
                </Carte>
                {decide ? (
                  <Carte titre="Ce que ce niveau décide">
                    <Text style={TYPO.corps}>{decide}.</Text>
                    <Text style={TYPO.note}>Les mêmes phrases que sur « Qui décide ».</Text>
                  </Carte>
                ) : null}
                {vote && vote.position && POSITION[vote.position] ? (
                  <Carte titre="Dernier fait publié">
                    <Text style={TYPO.corps}>
                      {`Le ${dateFr(vote.sc.d)}, position : ${POSITION[vote.position].toLowerCase()} sur « ${titreLisible(vote.sc.t)} ».`}
                    </Text>
                  </Carte>
                ) : null}
              </View>
            ) : null}

            {onglet === "votes" ? (
              depute ? (
                <View style={{ gap: PAS * 3 }}>
                  {vote && vote.position && POSITION[vote.position] ? (
                    <View style={{ gap: 4, paddingVertical: PAS * 2, borderBottomWidth: 1, borderBottomColor: couleurs.trait }}>
                      <Text style={TYPO.micro}>{dateFr(vote.sc.d)}</Text>
                      <Text style={[TYPO.corps, { fontWeight: "700" }]}>{titreLisible(vote.sc.t)}</Text>
                      <Text style={[TYPO.corps, { fontWeight: "800" }]}>{POSITION[vote.position]}</Text>
                    </View>
                  ) : (
                    <Text style={TYPO.note}>Aucun vote publié à montrer pour l'instant.</Text>
                  )}
                  <Pressable onPress={() => router.push("/vote")} accessibilityRole="button"
                    accessibilityLabel={`Voir tous les votes de ${nom}`}
                    style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                    <Text style={{ color: couleurs.lien, fontWeight: "700", textDecorationLine: "underline" }}>Voir tous ses votes ›</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={TYPO.note}>Cette fonction ne vote pas au Parlement. Repère n'affiche donc aucun vote pour elle.</Text>
              )
            ) : null}

            {onglet === "parcours" ? (
              <View style={{ gap: 4 }}>
                <Text style={[TYPO.corps, { fontWeight: "800" }]}>{p.role || nom}</Text>
                {p.institution ? <Text style={TYPO.note}>{p.institution}</Text> : null}
                {p.lieu ? <Text style={TYPO.note}>{p.lieu}</Text> : null}
                <Text style={[TYPO.note, { marginTop: PAS * 2 }]}>
                  Repère n'affiche que les faits de mandat publiés. Le patrimoine des élus, et leur présence ou absence aux séances, ne figurent jamais.
                </Text>
              </View>
            ) : null}

            <Carte titre="D'où viennent ces informations">
              <PastilleSource source={srcElus(r.srcElus ?? null)} />
            </Carte>
          </Animated.View>
        </Page>
      );
    }} />
  );
}
