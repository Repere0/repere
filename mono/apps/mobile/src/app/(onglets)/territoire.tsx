/* « CHEZ VOUS » — LE TERRITOIRE DE LA COMMUNE (refonte du 16/10/2026).
 *
 * Un ecran distinct de « Qui decide » : ici, on regarde OU l'on est (le
 * departement, la region, l'intercommunalite, la circonscription). « Qui decide »
 * reste la chaine des elus, une sortie en bas de l'ecran.
 *
 * Refonte : une seule carte compacte, quatre rubriques en une ligne chacune. Le
 * reste (pourquoi une circonscription, ce qu'est une intercommunalite) se deplie
 * a la demande. La phrase qui compte est la premiere.
 *
 * Aucun calcul ici : tout vient de la fiche (RNE), de l'index et du socle
 * (@repere/core). Une commune partagee entre plusieurs circonscriptions ne se
 * voit jamais attribuer un depute (invariant 5, phrases.js). Une donnee absente
 * porte sa phrase vraie (lib/absences.ts), jamais un tiret ni un zero. */
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { datePublication, dateFr, LIBELLES, nomIntercommunalite, ordinal } from "@repere/core";
import { Carte, Vide } from "../../lib/composants";
import { circoInconnue } from "../../lib/absences";
import { srcElus } from "../../lib/sources";
import { PAS, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Plus } from "../../ui/reponse";
import { Depli } from "../../ui/visuels";
import { Termes } from "../../lib/termes";

/* Une rubrique de la carte : un libelle discret, puis la reponse. */
function Rubrique({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View style={{ gap: PAS }}>
      <Text style={[TYPO.micro, { fontWeight: "700" }]}>{titre}</Text>
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
      return (
        <Page>
          <Stack.Screen options={{ title: "Chez vous" }} />
          {/* Sans etiquette « Chez vous » (16/10/2026) : la barre haute et l'onglet le
             disent deja ; le nom de la commune est la reponse. */}
          <Question question={nom} sous="Votre commune, dans son territoire." />
          {publie ? <Text style={TYPO.micro}>Publication Repère du {dateFr(publie)}</Text> : null}

          <Carte>
            <Rubrique titre="Département et région">
              {/* Le departement, puis la region sur sa ligne (16/10/2026) : sur une seule
                 ligne, « Île-de-France » se coupait au trait d'union (capture 390 px). */}
              {depIndex ? (
                <View>
                  <Text style={TYPO.reponse}>{depIndex.nom}</Text>
                  {depIndex.region ? <Text style={TYPO.note}>{`Région ${depIndex.region}`}</Text> : null}
                </View>
              ) : <Text style={TYPO.reponse}>Le département de cette commune n'est pas arrivé jusqu'ici.</Text>}
            </Rubrique>

            <Rubrique titre="Intercommunalité">
              <Text style={TYPO.reponse}>
                {agglo || "Le Répertoire national des élus ne porte pas d'intercommunalité pour cette commune."}
              </Text>
              {agglo ? (
                <Depli titre="Ce qu'elle décide">
                  <Text style={TYPO.note}>Ses compétences sont détaillées dans « {LIBELLES.qui} ».</Text>
                </Depli>
              ) : null}
              <PastilleSource court source={srcElus(r.srcElus)} />
            </Rubrique>

            {d.nbCircos > 1 ? (
              <Rubrique titre="Circonscription législative">
                <Termes texte={`${nom} est partagée entre ${d.nbCircos} circonscriptions.`} style={TYPO.reponse} />
                <Depli titre="Pourquoi aucun député n'est-il nommé ici ?">
                  <Text style={TYPO.note}>
                    Votre député dépend de votre adresse précise, que Repère ne demande pas. Le vote affiché dans « {LIBELLES.aujourdhui} » n'est qu'un exemple.
                  </Text>
                </Depli>
              </Rubrique>
            ) : d.nbCircos === 1 && circos.length === 1 ? (
              <Rubrique titre="Circonscription législative">
                {/* Le lien « Ce que veut dire « Circonscription » » suffit (16/10/2026) : un repli
                    « C'est quoi ? » redisait la meme definition juste en dessous. */}
                <Termes texte={`${nom} est dans la ${ordinal(circos[0])} circonscription.`} style={TYPO.reponse} />
              </Rubrique>
            ) : (
              <Vide {...circoInconnue(nom)} />
            )}
          </Carte>

          {/* ALLER PLUS LOIN — « Qui decide » est la premiere sortie, mais reste un lien : l'accueil
             ne le remonte pas en tete de la barre (decision du 15/10/2026). */}
          <View style={{ gap: PAS * 2 }}>
            <Text style={[TYPO.etiquette, { paddingHorizontal: PAS }]}>Aller plus loin</Text>
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
