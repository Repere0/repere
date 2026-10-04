/* EXPLORER DES SCRUTINS PUBLICS — lecture mobile.
 *
 * Principe UX : répondre d'abord, détailler ensuite.
 * Un scrutin doit être compris en quelques secondes : titre, date, résultat,
 * puis seulement les groupes et les positions individuelles.
 *
 * Les couleurs des groupes identifient uniquement les groupes. Elles ne codent
 * jamais la position du vote.
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  chargerQuestionsGouvernementIndex,
  chargerQuestionGouvernementLot,
  chargerScrutinsIndex,
  chargerScrutinLot,
  ETATS,
} from "../lib/donnees";
import { Page } from "../ui/page";
import { Vide } from "../lib/composants";
import { PastilleSource } from "../ui/source";
import { PAS, TYPO, couleurs, CIBLE, RAYON, OMBRE } from "../lib/theme";
import { dateFr, titreLisible } from "@repere/core";

type Resume = {
  n: string; d: string; t: string; ty: string; s: string;
  dec: { pour: string | number; contre: string | number; abstentions: string | number };
  nv?: string | number; url: string; lot: number;
};
type Position = { a: string; n: string | null; p: "p" | "c" | "a" };
type Groupe = {
  ref: string; nom: string; couleur: string;
  pour: number | null; contre: number | null; abstentions: number | null;
  positions: Position[];
};
type Detail = Resume & { u: string; groupes: Groupe[] };
type Paquet = {
  v: number;
  source: { producteur_affiche: string; licence: string; url: string; releve_le: string };
  scrutins: Detail[];
};
type QagResume = {
  uid: string; n: string; d: string;
  auteur: { ref: string | null; nom: string | null };
  groupe: { nom: string; abrege: string | null; couleur: string };
  ministere: string | null; url: string; lot: number;
};
type Qag = QagResume & { question: string | null; reponse: string | null; reponsePublieeLe: string | null };
type QagIndex = {
  v: number; source: { producteur_affiche: string; licence: string; url: string; releve_le: string };
  total: number; taille_lot: number; questions: QagResume[];
};
type QagPaquet = {
  v: number; source: QagIndex["source"]; lot: number; questions: Qag[];
};
type Index = {
  v: number;
  source: { producteur_affiche: string; licence: string; url: string; releve_le: string };
  total_source: number;
  total_publics: number;
  taille_lot: number;
  scrutins: Resume[];
};

const resultat = (x: Resume) =>
  [
    x.dec.pour != null ? `${x.dec.pour} pour` : null,
    x.dec.contre != null ? `${x.dec.contre} contre` : null,
    x.dec.abstentions != null ? `${x.dec.abstentions} abstention${Number(x.dec.abstentions) > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");

const position = (p: string) => p === "p" ? "Pour" : p === "c" ? "Contre" : "Abstention";

/* Les réponses QAG arrivent parfois avec le balisage HTML de la source.
 * Repère affiche le texte, pas le balisage. On ne reconstruit pas le contenu :
 * on nettoie uniquement la présentation. */
const textePropre = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const apercu = (s: string, max = 220) => {
  const t = textePropre(s);
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
};

const Stat = ({ valeur, libelle }: { valeur: string | number; libelle: string }) => (
  <View style={{ flex: 1, minWidth: 88, gap: 2 }}>
    <Text style={TYPO.chiffre}>{valeur}</Text>
    <Text style={TYPO.note}>{libelle}</Text>
  </View>
);

const Meta = ({ children }: { children: React.ReactNode }) => (
  <View style={{
    paddingHorizontal: PAS * 2, paddingVertical: PAS,
    borderRadius: RAYON.pastille, backgroundColor: couleurs.voile,
  }}>
    <Text style={TYPO.micro}>{children}</Text>
  </View>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={{ gap: PAS * 2 }}>
    <Text style={TYPO.etiquette}>{label}</Text>
    {children}
  </View>
);

export default function Scrutins() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"votes" | "qag">(params.mode === "qag" ? "qag" : "votes");
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [qagIndex, setQagIndex] = useState<QagIndex | null>(null);
  const [qagDetail, setQagDetail] = useState<Qag | null>(null);
  const [qagSelection, setQagSelection] = useState<string | null>(null);
  const [qagRecherche, setQagRecherche] = useState("");
  const [qagEtendue, setQagEtendue] = useState(false);
  const [index, setIndex] = useState<Index | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());
  const [chargementDetail, setChargementDetail] = useState(false);
  const [chargementQag, setChargementQag] = useState(false);

  useEffect(() => {
    chargerScrutinsIndex().then(r => {
      setEtat(r.etat);
      const d = r.donnees as Index | null;
      setIndex(d);
      if (d?.scrutins?.length) setSelection(d.scrutins[d.scrutins.length - 1].n);
    });
  }, []);

  useEffect(() => {
    chargerQuestionsGouvernementIndex().then(r => {
      const d = r.donnees as QagIndex | null;
      setQagIndex(d);
      if (d?.questions?.length) setQagSelection(d.questions[d.questions.length - 1].uid);
    });
  }, []);

  useEffect(() => {
    if (!qagIndex || !qagSelection) return;
    const resume = qagIndex.questions.find(x => x.uid === qagSelection);
    if (!resume) return;
    let vivant = true;
    setChargementQag(true);
    setQagEtendue(false);
    chargerQuestionGouvernementLot(resume.lot).then(r => {
      if (!vivant) return;
      const paquet = r.donnees as QagPaquet | null;
      setQagDetail(paquet?.questions.find(x => x.uid === qagSelection) || null);
      setChargementQag(false);
    });
    return () => { vivant = false; };
  }, [qagIndex, qagSelection]);

  useEffect(() => {
    if (!index || !selection) return;
    const resume = index.scrutins.find(x => x.n === selection);
    if (!resume) return;
    let vivant = true;
    setChargementDetail(true);
    chargerScrutinLot(resume.lot).then(r => {
      if (!vivant) return;
      const paquet = r.donnees as Paquet | null;
      setDetail(paquet?.scrutins.find(x => x.n === selection) || null);
      setChargementDetail(false);
    });
    return () => { vivant = false; };
  }, [index, selection]);

  const visibles = useMemo(() => {
    if (!index) return [];
    const q = recherche.trim().toLocaleLowerCase("fr");
    const source = q
      ? index.scrutins.filter(x => (x.n + " " + x.t + " " + x.ty).toLocaleLowerCase("fr").includes(q))
      : index.scrutins.slice(-18);
    return source.slice().reverse();
  }, [index, recherche]);

  const qagVisibles = useMemo(() => {
    if (!qagIndex) return [];
    const q = qagRecherche.trim().toLocaleLowerCase("fr");
    const source = q
      ? qagIndex.questions.filter(x => (x.n + " " + (x.auteur.nom || "") + " " + (x.ministere || "")).toLocaleLowerCase("fr").includes(q))
      : qagIndex.questions.slice(-18);
    return source.slice().reverse();
  }, [qagIndex, qagRecherche]);

  const choisir = (n: string) => {
    setSelection(n);
    setDetail(null);
    setOuverts(new Set());
  };

  return (
    <Page>
      <Stack.Screen options={{ title: "Scrutins publics" }} />

      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.etiquette}>Assemblée nationale</Text>
        <Text style={[TYPO.affiche, { fontSize: 34, lineHeight: 38 }]}>Ce qui s'est décidé</Text>
        <Text style={TYPO.note}>
          {index ? `${index.total_publics.toLocaleString("fr-FR")} scrutins publics · positions individuelles publiées.`
            : "Scrutins publics et Questions au Gouvernement, à partir des relevés officiels."}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: PAS * 2 }}>
        <Pressable
          onPress={() => setMode("votes")}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "votes" }}
          style={{ minHeight: CIBLE, flex: 1, paddingHorizontal: PAS * 3, justifyContent: "center", borderRadius: RAYON.pastille, backgroundColor: mode === "votes" ? couleurs.encre : couleurs.carte, borderWidth: 1, borderColor: mode === "votes" ? couleurs.encre : couleurs.trait }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700", color: mode === "votes" ? couleurs.blanc : couleurs.encre }}>Votes</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("qag")}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "qag" }}
          style={{ minHeight: CIBLE, flex: 1, paddingHorizontal: PAS * 2, justifyContent: "center", borderRadius: RAYON.pastille, backgroundColor: mode === "qag" ? couleurs.encre : couleurs.carte, borderWidth: 1, borderColor: mode === "qag" ? couleurs.encre : couleurs.trait }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700", color: mode === "qag" ? couleurs.blanc : couleurs.encre }}>Questions</Text>
        </Pressable>
      </View>

      {mode === "qag" ? (
        !qagIndex ? (
          <Vide titre="Chargement des questions." corps="Repère récupère le relevé officiel des séances de questions." />
        ) : (
          <>
            <Section label="Parcourir">
              <Text style={TYPO.note}>{qagIndex.total.toLocaleString("fr-FR")} questions au Gouvernement dans le relevé officiel.</Text>
              <TextInput
                value={qagRecherche}
                onChangeText={setQagRecherche}
                placeholder="Député, numéro ou ministère"
                placeholderTextColor={couleurs.sourd}
                accessibilityLabel="Rechercher une question au Gouvernement"
                style={{ minHeight: CIBLE, borderWidth: 1, borderColor: couleurs.trait, borderRadius: RAYON.bloc, paddingHorizontal: PAS * 3, color: couleurs.encre, backgroundColor: couleurs.carte }}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}>
                {qagVisibles.map(x => (
                  <Pressable
                    key={x.uid}
                    onPress={() => { setQagSelection(x.uid); setQagDetail(null); }}
                    accessibilityRole="button"
                    style={{
                      minHeight: CIBLE, width: 190, padding: PAS * 3,
                      borderRadius: RAYON.bloc, backgroundColor: x.uid === qagSelection ? couleurs.voile : couleurs.carte,
                      borderWidth: 1, borderColor: x.uid === qagSelection ? couleurs.encre : couleurs.trait,
                      borderLeftWidth: 5, borderLeftColor: x.groupe.couleur,
                    }}
                  >
                    <Text style={TYPO.micro}>{x.d ? dateFr(x.d) : "Date non fournie"} · n° {x.n}</Text>
                    <Text numberOfLines={2} style={TYPO.reponse}>{x.auteur.nom || "Auteur non identifié"}</Text>
                    <Text numberOfLines={1} style={TYPO.micro}>{x.ministere || "Ministère non précisé"}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Section>

            {chargementQag ? (
              <Vide titre="Chargement de la question." corps="Repère récupère le contenu publié par l'Assemblée nationale." />
            ) : qagDetail ? (
              <View style={{ gap: PAS * 5 }}>
                <View style={{ gap: PAS * 2 }}>
                  <Text style={TYPO.etiquette}>Question au Gouvernement</Text>
                  <Text style={TYPO.question}>Question n° {qagDetail.n}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS }}>
                    <Meta>{qagDetail.auteur.nom || "Auteur non identifié"}</Meta>
                    <Meta>{qagDetail.ministere || "Ministère non précisé"}</Meta>
                    <Meta>{qagDetail.d ? dateFr(qagDetail.d) : "Date non fournie"}</Meta>
                  </View>
                </View>

                <View style={[{
                  padding: PAS * 5, borderRadius: RAYON.carte,
                  backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait,
                }, OMBRE]}>
                  <Text style={TYPO.etiquette}>En bref</Text>
                  <Text style={[TYPO.reponse, { marginTop: PAS * 2 }]}>
                    {qagDetail.auteur.nom || "Un député"} a posé une question
                    {qagDetail.ministere ? ` au ${qagDetail.ministere}` : ""}.
                  </Text>
                  <Text style={[TYPO.note, { marginTop: PAS }]}>
                    Repère sépare la question de la réponse pour rendre la lecture plus rapide.
                  </Text>
                </View>

                <Section label="La question">
                  {qagDetail.question ? (
                    <View style={{ padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.voile }}>
                      <Text style={TYPO.corps}>{textePropre(qagDetail.question)}</Text>
                    </View>
                  ) : (
                    <Vide titre="Le texte de la question n'est pas fourni dans ce relevé." corps="Repère ne le reconstruit pas à partir d'une autre source." />
                  )}
                </Section>

                <Section label="La réponse du Gouvernement">
                  {qagDetail.reponse ? (
                    <View style={{ padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
                      <Text style={TYPO.corps}>
                        {qagEtendue ? textePropre(qagDetail.reponse) : apercu(qagDetail.reponse, 520)}
                      </Text>
                      {textePropre(qagDetail.reponse).length > 520 ? (
                        <Pressable onPress={() => setQagEtendue(v => !v)} accessibilityRole="button" style={{ minHeight: CIBLE, justifyContent: "center", marginTop: PAS * 2 }}>
                          <Text style={{ color: couleurs.lien, fontWeight: "700" }}>
                            {qagEtendue ? "Réduire la réponse ↑" : "Lire toute la réponse ↓"}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : (
                    <Vide titre="Aucune réponse textuelle fournie dans ce relevé." corps="Cela ne signifie pas qu'il n'y a pas eu de réponse : Repère ne l'invente pas." />
                  )}
                </Section>

                <PastilleSource court source={{
                  producteur: qagIndex.source.producteur_affiche,
                  licence: qagIndex.source.licence,
                  url: qagDetail.url,
                  releve: qagIndex.source.releve_le,
                  usage: "Repère reprend les informations publiées par l'Assemblée nationale pour cette Question au Gouvernement.",
                }} />
              </View>
            ) : null}
          </>
        )
      ) : (
        !index ? (
          <Vide
            titre={etat === ETATS.EN_COURS ? "Chargement des scrutins." : "Les scrutins ne sont pas disponibles."}
            corps="Repère n'affiche pas une position quand le relevé détaillé n'est pas disponible."
          />
        ) : (
          <>
            <Section label="Parcourir les votes">
              <TextInput
                value={recherche}
                onChangeText={setRecherche}
                placeholder="Numéro ou mots du texte"
                placeholderTextColor={couleurs.sourd}
                accessibilityLabel="Rechercher un scrutin"
                style={{ minHeight: CIBLE, borderWidth: 1, borderColor: couleurs.trait, borderRadius: RAYON.bloc, paddingHorizontal: PAS * 3, color: couleurs.encre, backgroundColor: couleurs.carte }}
              />
              <Text style={TYPO.micro}>
                {recherche ? `${visibles.length} résultat${visibles.length > 1 ? "s" : ""}` : "Les 18 derniers · recherchez pour toute l'archive"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}>
                {visibles.map(x => (
                  <Pressable
                    key={x.n}
                    onPress={() => choisir(x.n)}
                    accessibilityRole="button"
                    accessibilityLabel={`Scrutin n°${x.n}, ${dateFr(x.d)}`}
                    style={{
                      minHeight: CIBLE, width: 205, padding: PAS * 3,
                      borderRadius: RAYON.bloc, backgroundColor: x.n === selection ? couleurs.encre : couleurs.carte,
                      borderWidth: 1, borderColor: x.n === selection ? couleurs.encre : couleurs.trait,
                    }}
                  >
                    <Text style={[TYPO.micro, { color: x.n === selection ? "#d8d5ce" : couleurs.sourd }]}>{dateFr(x.d)} · n° {x.n}</Text>
                    <Text numberOfLines={3} style={{ marginTop: PAS, fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 17, lineHeight: 21, color: x.n === selection ? couleurs.blanc : couleurs.encre }}>
                      {titreLisible(x.t)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Section>

            {chargementDetail ? (
              <Vide titre="Chargement du vote." corps="Repère récupère le détail nominatif de ce scrutin." />
            ) : detail ? (
              <View style={{ gap: PAS * 5 }}>
                <View style={{ gap: PAS * 2 }}>
                  <Text style={TYPO.etiquette}>Scrutin public</Text>
                  <Text style={[TYPO.question, { fontSize: 26, lineHeight: 31 }]}>{titreLisible(detail.t)}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS }}>
                    <Meta>{dateFr(detail.d)}</Meta>
                    <Meta>Scrutin n° {detail.n}</Meta>
                    <Meta>{detail.ty}</Meta>
                  </View>
                </View>

                <View style={[{
                  padding: PAS * 5, borderRadius: RAYON.carte,
                  backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait,
                }, OMBRE]}>
                  <Text style={TYPO.etiquette}>Résultat</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: PAS * 3, gap: PAS * 3 }}>
                    <Stat valeur={detail.dec.pour ?? "—"} libelle="pour" />
                    <Stat valeur={detail.dec.contre ?? "—"} libelle="contre" />
                    <Stat valeur={detail.dec.abstentions ?? "—"} libelle="abstention" />
                  </View>
                  <Text style={[TYPO.note, { marginTop: PAS * 2 }]}>
                    Résultat global du scrutin. Les couleurs ne représentent pas les positions.
                  </Text>
                </View>

                <Section label="Les groupes parlementaires">
                  <Text style={TYPO.note}>
                    Ouvrez un groupe pour voir les positions individuelles publiées.
                  </Text>
                  <View style={{ gap: PAS * 2 }}>
                    {detail.groupes.map(g => {
                      const ouvert = ouverts.has(g.ref);
                      return (
                        <View key={g.ref} style={{ borderRadius: RAYON.bloc, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, overflow: "hidden" }}>
                          <Pressable
                            onPress={() => setOuverts(prev => {
                              const n = new Set(prev);
                              if (n.has(g.ref)) n.delete(g.ref); else n.add(g.ref);
                              return n;
                            })}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: ouvert }}
                            accessibilityLabel={`${g.nom}, ${g.positions.length} positions publiées`}
                            style={{ minHeight: CIBLE, padding: PAS * 3, justifyContent: "center", borderLeftWidth: 5, borderLeftColor: g.couleur }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                              <View accessibilityElementsHidden style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: g.couleur }} />
                              <Text style={{ flex: 1, fontWeight: "700", color: couleurs.encre }}>{g.nom}</Text>
                              <Text style={TYPO.micro}>{ouvert ? "Masquer" : "Voir"}</Text>
                            </View>
                            <Text style={[TYPO.note, { marginTop: PAS }]}>
                              {[g.pour != null ? `${g.pour} pour` : null, g.contre != null ? `${g.contre} contre` : null, g.abstentions != null ? `${g.abstentions} abstention${g.abstentions > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ")}
                            </Text>
                          </Pressable>

                          {ouvert ? (
                            <View style={{ borderTopWidth: 1, borderTopColor: couleurs.trait }}>
                              {g.positions.map((p, i) => (
                                <View key={p.a + i} style={{ minHeight: CIBLE, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                                  <Text style={{ flex: 1, color: couleurs.encre }}>{p.n || p.a}</Text>
                                  <Text style={{ fontWeight: "700", color: couleurs.sourd }}>{position(p.p)}</Text>
                                </View>
                              ))}
                              {!g.positions.length ? <Text style={[TYPO.note, { padding: PAS * 3 }]}>Aucune position individuelle publiée pour ce groupe sur ce scrutin.</Text> : null}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                </Section>

                <View style={{ paddingTop: PAS * 2 }}>
                  <PastilleSource court source={{
                    producteur: index.source.producteur_affiche,
                    licence: index.source.licence,
                    url: detail.url,
                    releve: index.source.releve_le,
                    usage: "Repère reprend les positions individuelles publiées par l'Assemblée nationale pour ce scrutin. Les non-votants et les mises au point ne sont pas republies.",
                  }} />
                </View>
              </View>
            ) : null}
          </>
        )
      )}
    </Page>
  );
}
