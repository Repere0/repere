/* « CETTE SEMAINE À [COMMUNE] » — 30/10/2026 (D29, D30, D31).
 *
 * L'actualite locale hebdomadaire, redigee par le CEO dans data/actus-hebdo.json, pour les
 * communes pilotes seulement (Melun, Meaux, Versailles au demarrage). Pour une autre commune,
 * rien : la carte annoncerait une actualite qui ne viendra pas.
 *
 * TROIS ETATS, SANS FAUSSE FRAICHEUR (invariant 9) :
 * - publication de moins de 7 jours, entree remplie : le titre, le resume, la source, le
 *   partage (carte story « Actualité locale ») ;
 * - entree plus ancienne : « Aucune actu cette semaine », et la derniere derriere « Voir la
 *   dernière actu de [Commune] », avec sa date ;
 * - entree vide ou absente : « Aucune actu cette semaine ».
 * D35 (30/10/2026) : aucune promesse de rythme (« Repère publie quand il y a du nouveau »),
 * et un lien vers l'ecran Actualites (« Voir les dernières publications »).
 * Une date de publication dans le futur n'est pas montree avant ce jour. */
import { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ageReleve, dateFr } from "@repere/core";
import { chargerActusHebdo } from "../lib/donnees";
import { Carte } from "../lib/composants";
import { couleurs, CIBLE, PAS, TYPO } from "../lib/theme";
import { PartagerCarte } from "./partage/bouton-partage";
import { ActuStory } from "./partage/variantes/actu.story";
import { ilYa } from "./fraicheur";

type Entree = { titre?: string; resume?: string; source?: string; source_nom?: string };
type Fichier = { semaine?: string; date_publication?: string; communes?: Record<string, Entree> };
export const RECENTE_JOURS = 7;
export const remplie = (e?: Entree | null): e is Required<Pick<Entree, "titre" | "resume" | "source">> & Entree =>
  !!e && !!e.titre && !!e.resume && typeof e.source === "string" && /^https:\/\//.test(e.source);

export function CetteSemaineCommune({ insee, nom }: { insee: string; nom: string }) {
  const [f, setF] = useState<Fichier | null>(null);
  const [voir, setVoir] = useState(false);
  useEffect(() => {
    let vivant = true;
    chargerActusHebdo().then(r => { if (vivant) setF(r.donnees ? (r.donnees as Fichier) : null); }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  if (!f || !f.communes || !(insee in f.communes)) return null;      /* pas une commune pilote */
  const date = /^\d{4}-\d{2}-\d{2}$/.test(f.date_publication || "") ? (f.date_publication as string) : null;
  const age = date ? ageReleve(date) : null;
  const e = f.communes[insee];
  const publiee = remplie(e) && age !== null && age >= 0;            /* jamais une date future */
  const recente = publiee && (age as number) < RECENTE_JOURS;
  const bloc = publiee ? (
    <View style={{ gap: PAS * 2 }}>
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{e!.titre}</Text>
      <Text style={TYPO.corps}>{e!.resume}</Text>
      <Text style={TYPO.micro}>Publiée le {dateFr(date as string)} · {ilYa(age as number)}</Text>
      <Pressable onPress={() => Linking.openURL(e!.source as string)} accessibilityRole="link"
        accessibilityLabel={`Source : ${e!.source_nom || "page officielle"}, ouvre un site externe`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: couleurs.lien, fontWeight: "500", textDecorationLine: "underline" }}>Source : {e!.source_nom || "page officielle"}</Text>
      </Pressable>
      <PartagerCarte etiquette={`Partager l'actualité de ${nom}`}
        repli={`${nom} : ${e!.titre}. ${e!.resume} Source : ${e!.source}`}
        rendu={ref => <ActuStory refCarte={ref} etiquette={`Actualité locale · ${nom}`} titre={e!.titre as string} corps={e!.resume as string}
          source={`Source : ${e!.source_nom || "page officielle"}, publiée par Repère le ${dateFr(date as string)}.`} />} />
    </View>
  ) : null;
  return (
    <Carte echelon="ville" titre={`Cette semaine à ${nom}`}>
      {recente ? bloc : (
        <View style={{ gap: PAS * 2 }}>
          <Text style={TYPO.corps}>Repère publie quand il y a du nouveau. Aucune actu cette semaine pour {nom}.</Text>
          {publiee && !voir ? (
            <Pressable onPress={() => setVoir(true)} accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: couleurs.lien, fontWeight: "500", textDecorationLine: "underline" }}>Voir la dernière actu de {nom}</Text>
            </Pressable>
          ) : null}
          {publiee && voir ? bloc : null}
          <Pressable onPress={() => router.push("/actus")} accessibilityRole="link"
            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: couleurs.lien, fontWeight: "500", textDecorationLine: "underline" }}>Voir les dernières publications</Text>
          </Pressable>
        </View>
      )}
    </Carte>
  );
}
