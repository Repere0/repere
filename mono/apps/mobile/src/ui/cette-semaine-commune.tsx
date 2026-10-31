/* « CETTE SEMAINE À [COMMUNE] » — 30/10/2026 (D29, D30, D31), élargi le 31/10/2026 (D81).
 *
 * L'actualite locale hebdomadaire, redigee par le CEO dans data/actus-hebdo.json, pour les
 * communes pilotes seulement (Melun, Meaux, Versailles au demarrage). Pour une autre commune,
 * rien : la carte annoncerait une actualite qui ne viendra pas.
 *
 * D81 (ADR 0007) : les actualites publiees par le flux RSS officiel de la mairie s'affichent
 * aussi, étiquetées « Automatique · flux RSS officiel », trois au plus. Elles ne sont jamais
 * présentées sous « Cette semaine » si elles ont plus de 7 jours.
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
import { actusFlux, chargerActuellesRss, chargerActusHebdo } from "../lib/donnees";
import { Carte } from "../lib/composants";
import { couleurs, CIBLE, PAS, TYPO } from "../lib/theme";
import { PartagerCarte } from "./partage/bouton-partage";
import { ActuStory } from "./partage/variantes/actu.story";
import { ilYa } from "./fraicheur";

type Entree = { titre?: string; resume?: string; source?: string; source_nom?: string };
type Fichier = { semaine?: string; date_publication?: string; communes?: Record<string, Entree> };
type Flux = { communes?: Record<string, { items?: { titre: string; resume?: string; date: string; lien: string }[] }> };
type ActuFluxEntree = { titre: string; resume?: string; date: string; lien: string };
export const RECENTE_JOURS = 7;
export const remplie = (e?: Entree | null): e is Required<Pick<Entree, "titre" | "resume" | "source">> & Entree =>
  !!e && !!e.titre && !!e.resume && typeof e.source === "string" && /^https:\/\//.test(e.source);

export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Une actualité d'un flux officiel : son étiquette, sa date, son lien. Aucune autre mise en forme. */
function ActuFlux({ x }: { x: ActuFluxEntree }) {
  return (
    <View style={{ gap: PAS * 2 }}>
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{x.titre}</Text>
      {x.resume ? <Text style={TYPO.corps}>{x.resume}</Text> : null}
      <Text style={TYPO.micro}>Automatique · flux RSS officiel · publiée le {dateFr(x.date)} · {ilYa(ageReleve(x.date) as number)}</Text>
      <Pressable onPress={() => Linking.openURL(x.lien)} accessibilityRole="link"
        accessibilityLabel="Source : site de la mairie, ouvre un site externe"
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: couleurs.lien, fontWeight: "500", textDecorationLine: "underline" }}>Source : site de la mairie</Text>
      </Pressable>
    </View>
  );
}

export function CetteSemaineCommune({ insee, nom }: { insee: string; nom: string }) {
  const [f, setF] = useState<Fichier | null>(null);
  const [rss, setRss] = useState<Flux | null>(null);
  const [voir, setVoir] = useState(false);
  useEffect(() => {
    let vivant = true;
    chargerActusHebdo().then(r => { if (vivant) setF(r.donnees ? (r.donnees as Fichier) : null); }).catch(() => {});
    chargerActuellesRss().then(r => { if (vivant) setRss(r.donnees ? (r.donnees as Flux) : null); }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  const e = f?.communes?.[insee];                                    /* undefined : pas une commune pilote */
  const flux: ActuFluxEntree[] = actusFlux(rss, insee, aujourdhui());
  if (e === undefined && flux.length === 0) return null;              /* ni pilote, ni flux : rien à annoncer */
  const date = f?.date_publication && /^\d{4}-\d{2}-\d{2}$/.test(f.date_publication) ? f.date_publication : null;
  const age = date ? ageReleve(date) : null;
  const publiee = remplie(e) && age !== null && age >= 0;            /* jamais une date future */
  const recente = publiee && (age as number) < RECENTE_JOURS;
  if (!recente && flux.length > 0) {
    return (
      <Carte echelon="ville" titre="Actus publiées par la mairie">
        <View style={{ gap: PAS * 4 }}>{flux.map(x => <ActuFlux key={x.lien} x={x} />)}</View>
      </Carte>
    );
  }
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
