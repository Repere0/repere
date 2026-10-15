/* « CHEZ VOUS » — LE TERRITOIRE DE LA COMMUNE (16/10/2026).
 *
 * Un ecran distinct de « Qui décide » : ici, on regarde OU l'on est (le
 * département, la région, l'intercommunalité, la circonscription) ; « Qui
 * décide » reste la chaine des élus, un lien en tête de liste.
 *
 * Aucun calcul ici : tout vient de la fiche (RNE), de l'index et du socle
 * (@repere/core). Une commune partagée entre plusieurs circonscriptions ne se
 * voit jamais attribuer un député (invariant 5, phrases.js). Une donnée absente
 * porte sa phrase vraie (lib/absences.ts), jamais un tiret ni un zéro. */
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { datePublication, dateFr, LIBELLES, nomIntercommunalite, ordinal } from "@repere/core";
import { Vide } from "../../lib/composants";
import { circoInconnue } from "../../lib/absences";
import { srcElus } from "../../lib/sources";
import { PAS, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Etiquette } from "../../ui/resume";
import { Plus } from "../../ui/reponse";
import { Termes } from "../../lib/termes";

/* Une rubrique : un titre court, puis la phrase, puis une note si besoin. */
function Ligne({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View style={{ gap: PAS }}>
      <Etiquette texte={titre} />
      {children}
    </View>
  );
}

export default function ChezVousTerritoire() {
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const fiche = d.fiche || {};
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      const publie = datePublication(r.index);
      const agglo = nomIntercommunalite(fiche.agglo && fiche.agglo.nom);
      const circos: number[] = Array.isArray(fiche.circo) ? fiche.circo : (fiche.circo == null ? [] : [fiche.circo]);
      const territoire = depIndex ? [depIndex.nom, depIndex.region].filter(Boolean).join(" · ") : null;
      return (
        <Page>
          <Stack.Screen options={{ title: "Chez vous" }} />
          <Question emoji="🏠" etiquette="Chez vous" question={nom}
            sous="Où se trouve votre commune : son département, sa région, son intercommunalité et sa circonscription législative." />
          {publie ? <Text style={TYPO.micro}>Publication Repère du {dateFr(publie)}</Text> : null}

          <View style={{ gap: PAS * 4 }}>
            <Ligne titre="Département et région">
              <Text style={TYPO.reponse}>{territoire || "Le département de cette commune n'est pas arrivé jusqu'ici."}</Text>
            </Ligne>

            <Ligne titre="Intercommunalité">
              <Text style={TYPO.reponse}>
                {agglo || "Le Répertoire national des élus ne porte pas d'intercommunalité pour cette commune."}
              </Text>
              {agglo ? <Text style={TYPO.note}>Ses compétences sont détaillées dans « {LIBELLES.qui} ».</Text> : null}
              <PastilleSource court source={srcElus(r.srcElus)} />
            </Ligne>

            {d.nbCircos > 1 ? (
              <Ligne titre="Circonscription législative">
                <Termes texte={`${nom} est partagée entre ${d.nbCircos} circonscriptions.`} style={TYPO.reponse} />
                <Text style={TYPO.note}>
                  Votre député dépend de votre adresse précise, que Repère ne demande pas. Le vote affiché dans « {LIBELLES.aujourdhui} » n'est qu'un exemple.
                </Text>
              </Ligne>
            ) : d.nbCircos === 1 && circos.length === 1 ? (
              <Ligne titre="Circonscription législative">
                <Termes texte={`${nom} est dans la ${ordinal(circos[0])} circonscription.`} style={TYPO.reponse} />
                <Text style={TYPO.note}>Une circonscription est une partie du territoire dont les électeurs élisent un député.</Text>
              </Ligne>
            ) : (
              <Vide {...circoInconnue(nom)} />
            )}
          </View>

          {/* ALLER PLUS LOIN — « Qui décide » est la premiere sortie, mais reste un lien : l'accueil
             ne le remonte pas en tete de la barre (decision du 15/10/2026). */}
          <View style={{ gap: PAS * 2 }}>
            <Etiquette texte="Aller plus loin" />
            <View>
              <Plus premier texte={`${LIBELLES.qui} pour ${nom}`} onPress={() => router.push("/qui-decide")} />
              <Plus texte={LIBELLES.argent} onPress={() => router.push("/argent")} />
              <Plus texte={LIBELLES.calendrier} onPress={() => router.push("/a-venir")} />
              <Plus dernier texte={LIBELLES.sources} onPress={() => router.push("/sources")} />
            </View>
          </View>

          <Text style={TYPO.note}>Repère ne classe ni ne note personne, et ne compare jamais deux communes.</Text>
        </Page>
      );
    }} />
  );
}
