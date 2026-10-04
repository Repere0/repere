/* EXPLORER DES SCRUTINS — lecture d'abord, détail ensuite.
 *
 * Principe UX : en moins de 5 secondes, le lecteur doit voir :
 * 1. ce qui a été voté ;
 * 2. le résultat ;
 * 3. la position des groupes ;
 * 4. puis seulement les positions individuelles et la source.
 *
 * Les couleurs de groupes servent uniquement à reconnaître les groupes.
 * Elles ne codent jamais Pour / Contre / Abstention.
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

const position = (p: string) => p === "p" ? "Pour" : p === "c" ? "Contre" : "Abstention";

function nombre(v: string | number | null | undefined) {
  return v == null ? "—" : Number(v).toLocaleString("fr-FR");
}

function resultatCourt(x: Resume) {
  return [
    x.dec.pour != null ? `${nombre(x.dec.pour)} pour` : null,
    x.dec.contre != null ? `${nombre(x.dec.contre)} contre` : null,
    x.dec.abstentions != null ? `${nombre(x.dec.abstentions)} abstention${Number(x.dec.abstentions) > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");
}

/* Les archives QAG contiennent du HTML dans certains champs. Repère n'affiche
 * jamais les balises brutes : on nettoie uniquement la présentation, sans
 * reconstituer ni résumer le contenu absent. */
function textePropre(value: string | null | undefined) {
  if (!value) return null;
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function StatutVote({ detail }: { detail: Detail }) {
  return (
    <View style={s.resultat} accessible accessibilityLabel={resultatCourt(detail)}>
      <View style={s.stat}><Text style={s.statNombre}>{nombre(detail.dec.pour)}</Text><Text style={s.statLibelle}>pour</Text></View>
      <View style={s.statSep} />
      <View style={s.stat}><Text style={s.statNombre}>{nombre(detail.dec.contre)}</Text><Text style={s.statLibelle}>contre</Text></View>
      <View style={s.statSep} />
      <View style={s.stat}><Text style={s.statNombre}>{nombre(detail.dec.abstentions)}</Text><Text style={s.statLibelle}>abstention</Text></View>
    </View>
  );
}

function GroupeRow({ groupe, ouvert, onPress }: { groupe: Groupe; ouvert: boolean; onPress: () => void }) {
  const total = (groupe.pour || 0) + (groupe.contre || 0) + (groupe.abstentions || 0);
  return (
    <View style={s.groupe}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`${groupe.nom}, ${total} positions publiées`}
        style={({ pressed }) => [s.groupeTete, pressed && { opacity: 0.65 }]}
      >
        <View style={[s.groupePoint, { backgroundColor: groupe.couleur }]} />
        <View style={s.groupeTexte}>
          <Text style={s.groupeNom}>{groupe.nom}</Text>
          <Text style={s.groupeStats}>
            {[groupe.pour != null ? `${groupe.pour} pour` : null, groupe.contre != null ? `${groupe.contre} contre` : null, groupe.abstentions != null ? `${groupe.abstentions} abst.` : null].filter(Boolean).join(" · ")}
          </Text>
        </View>
        <Text style={s.chevron}>{ouvert ? "−" : "+"}</Text>
      </Pressable>
      {ouvert ? (
        <View style={s.positions}>
          {groupe.positions.map((p, i) => (
            <View key={p.a + i} style={s.positionLigne}>
              <Text style={s.positionNom}>{p.n || p.a}</Text>
              <Text style={s.positionValeur}>{position(p.p)}</Text>
            </View>
          ))}
          {!groupe.positions.length ? <Text style={TYPO.note}>Aucune position individuelle publiée pour ce groupe sur ce scrutin.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function Onglets({ mode, setMode }: { mode: "votes" | "qag"; setMode: (m: "votes" | "qag") => void }) {
  return (
    <View style={s.onglets}>
      <Pressable onPress={() => setMode("votes")} accessibilityRole="tab" accessibilityState={{ selected: mode === "votes" }} style={[s.onglet, mode === "votes" && s.ongletActif]}>
        <Text style={[s.ongletTexte, mode === "votes" && s.ongletTexteActif]}>Votes publics</Text>
      </Pressable>
      <Pressable onPress={() => setMode("qag")} accessibilityRole="tab" accessibilityState={{ selected: mode === "qag" }} style={[s.onglet, mode === "qag" && s.ongletActif]}>
        <Text style={[s.ongletTexte, mode === "qag" && s.ongletTexteActif]}>Questions au Gouvernement</Text>
      </Pressable>
    </View>
  );
}

export default function Scrutins() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"votes" | "qag">(params.mode === "qag" ? "qag" : "votes");
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [qagIndex, setQagIndex] = useState<QagIndex | null>(null);
  const [qagDetail, setQagDetail] = useState<Qag | null>(null);
  const [qagSelection, setQagSelection] = useState<string | null>(null);
  const [qagRecherche, setQagRecherche] = useState("");
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
      : index.scrutins.slice(-16);
    return source.slice().reverse();
  }, [index, recherche]);

  const qagVisibles = useMemo(() => {
    if (!qagIndex) return [];
    const q = qagRecherche.trim().toLocaleLowerCase("fr");
    const source = q
      ? qagIndex.questions.filter(x => (x.n + " " + (x.auteur.nom || "") + " " + (x.ministere || "")).toLocaleLowerCase("fr").includes(q))
      : qagIndex.questions.slice(-12);
    return source.slice().reverse();
  }, [qagIndex, qagRecherche]);

  const choisir = (n: string) => { setSelection(n); setDetail(null); setOuverts(new Set()); };
  const choisirQag = (uid: string) => { setQagSelection(uid); setQagDetail(null); };

  return (
    <Page>
      <Stack.Screen options={{ title: "Scrutins publics" }} />

      <View style={s.intro}>
        <Text style={TYPO.question}>Les votes de l'Assemblée</Text>
        <Text style={TYPO.note}>
          {index ? `${index.total_publics.toLocaleString("fr-FR")} scrutins publics depuis le début de la législature.`
            : "Les scrutins publics de la XVIIe législature."}
        </Text>
      </View>

      <Onglets mode={mode} setMode={setMode} />

      {mode === "qag" ? (
        !qagIndex ? (
          <Vide titre="Chargement des questions au Gouvernement." corps="Repère récupère le relevé officiel des séances de questions." />
        ) : (
          <>
            <View style={s.resumeEntete}>
              <Text style={TYPO.etiquette}>À l'Assemblée</Text>
              <Text style={s.resumeNombre}>{qagIndex.total.toLocaleString("fr-FR")}</Text>
              <Text style={s.resumePhrase}>questions au Gouvernement dans le relevé officiel</Text>
            </View>

            <TextInput
              value={qagRecherche}
              onChangeText={setQagRecherche}
              placeholder="Rechercher un député ou un ministère"
              placeholderTextColor={couleurs.sourd}
              accessibilityLabel="Rechercher une question au Gouvernement"
              style={s.recherche}
            />

            <Text style={TYPO.etiquette}>{qagRecherche ? `${qagVisibles.length} résultat${qagVisibles.length > 1 ? "s" : ""}` : "Questions récentes"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroller}>
              {qagVisibles.map(x => (
                <Pressable key={x.uid} onPress={() => choisirQag(x.uid)} accessibilityRole="button"
                  style={({ pressed }) => [s.selectionCard, x.uid === qagSelection && s.selectionCardActive, pressed && { opacity: 0.7 }]}>
                  <Text style={TYPO.micro}>{x.d ? dateFr(x.d) : "Date non fournie"} · n° {x.n}</Text>
                  <Text numberOfLines={2} style={s.selectionTitre}>{x.auteur.nom || "Auteur non identifié"}</Text>
                  <Text numberOfLines={1} style={TYPO.note}>{x.ministere || "Ministère non précisé"}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {chargementQag ? <Vide titre="Chargement de la question." corps="Repère récupère le contenu publié par l'Assemblée nationale." /> : qagDetail ? (
              <View style={s.detail}>
                <Text style={TYPO.etiquette}>Question au Gouvernement · n° {qagDetail.n}</Text>
                <Text style={s.detailTitre}>{qagDetail.auteur.nom || "Auteur non identifié"}</Text>
                <Text style={TYPO.note}>{qagDetail.groupe.nom} · {qagDetail.ministere || "Ministère non précisé"} · {dateFr(qagDetail.d)}</Text>

                {qagDetail.question ? (
                  <View style={s.blocLecture}>
                    <Text style={TYPO.etiquette}>La question</Text>
                    <Text style={TYPO.corps}>{textePropre(qagDetail.question)}</Text>
                  </View>
                ) : (
                  <View style={s.absence}>
                    <Text style={[TYPO.corps, { fontWeight: "700" }]}>Le texte de la question n'est pas fourni.</Text>
                    <Text style={TYPO.note}>Repère ne le reconstruit pas à partir d'une autre source.</Text>
                  </View>
                )}

                <View style={s.reponseBloc}>
                  <Text style={TYPO.etiquette}>Réponse du Gouvernement</Text>
                  {qagDetail.reponse ? <Text style={TYPO.corps}>{textePropre(qagDetail.reponse)}</Text>
                    : <Text style={TYPO.note}>Aucune réponse textuelle n'est fournie dans ce relevé.</Text>}
                </View>

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
            <View style={s.resumeEntete}>
              <Text style={TYPO.etiquette}>Dernier scrutin</Text>
              <Text style={s.resumeNombre}>{index.total_publics.toLocaleString("fr-FR")}</Text>
              <Text style={s.resumePhrase}>scrutins publics accessibles dans l'archive</Text>
            </View>

            <TextInput
              value={recherche}
              onChangeText={setRecherche}
              placeholder="Rechercher un scrutin ou un texte"
              placeholderTextColor={couleurs.sourd}
              accessibilityLabel="Rechercher un scrutin"
              style={s.recherche}
            />

            <Text style={TYPO.etiquette}>{recherche ? `${visibles.length} résultat${visibles.length > 1 ? "s" : ""}` : "Scrutins récents"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroller}>
              {visibles.map(x => (
                <Pressable
                  key={x.n}
                  onPress={() => choisir(x.n)}
                  accessibilityRole="button"
                  accessibilityLabel={`Scrutin n°${x.n}, ${dateFr(x.d)}`}
                  style={({ pressed }) => [s.selectionCard, x.n === selection && s.selectionCardActive, pressed && { opacity: 0.7 }]}
                >
                  <Text style={TYPO.micro}>{dateFr(x.d)} · n° {x.n}</Text>
                  <Text numberOfLines={3} style={s.selectionTitre}>{titreLisible(x.t)}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {chargementDetail ? (
              <Vide titre="Chargement du vote." corps="Repère récupère le détail nominatif de ce scrutin." />
            ) : detail ? (
              <View style={s.detail}>
                <Text style={TYPO.etiquette}>{detail.ty} · {dateFr(detail.d)} · scrutin n° {detail.n}</Text>
                <Text style={s.detailTitre}>{titreLisible(detail.t)}</Text>

                <View style={s.blocLecture}>
                  <Text style={TYPO.etiquette}>En bref</Text>
                  <Text style={s.phraseResultat}>{resultatCourt(detail)}</Text>
                  <StatutVote detail={detail} />
                </View>

                <Text style={TYPO.etiquette}>Position des groupes</Text>
                <Text style={TYPO.note}>Touchez un groupe pour voir les députés dont la position est publiée.</Text>
                <View style={s.groupes}>
                  {detail.groupes.map(g => (
                    <GroupeRow key={g.ref} groupe={g} ouvert={ouverts.has(g.ref)} onPress={() => setOuverts(prev => {
                      const n = new Set(prev);
                      if (n.has(g.ref)) n.delete(g.ref); else n.add(g.ref);
                      return n;
                    })} />
                  ))}
                </View>

                <PastilleSource court source={{
                  producteur: index.source.producteur_affiche,
                  licence: index.source.licence,
                  url: detail.url,
                  releve: index.source.releve_le,
                  usage: "Repère reprend les positions individuelles publiées par l'Assemblée nationale pour ce scrutin. Les non-votants et les mises au point ne sont pas republies.",
                }} />
              </View>
            ) : null}
          </>
        )
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  intro: { gap: PAS, paddingTop: PAS * 2 },
  onglets: {
    flexDirection: "row", backgroundColor: couleurs.voile, borderRadius: RAYON.bloc,
    padding: 3, gap: 3,
  },
  onglet: {
    minHeight: CIBLE, flex: 1, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 2,
  },
  ongletActif: { backgroundColor: couleurs.carte, ...OMBRE },
  ongletTexte: { fontSize: 14, lineHeight: 18, color: couleurs.sourd, fontWeight: "600", textAlign: "center" },
  ongletTexteActif: { color: couleurs.encre },
  resumeEntete: {
    backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: 2, ...OMBRE,
  },
  resumeNombre: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 34, lineHeight: 38, color: couleurs.encre, marginTop: PAS },
  resumePhrase: { fontSize: 16, lineHeight: 22, color: couleurs.sourd },
  recherche: {
    minHeight: CIBLE, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait,
    borderRadius: RAYON.bloc, paddingHorizontal: PAS * 4, color: couleurs.encre, fontSize: 16,
  },
  scroller: { gap: PAS * 2, paddingRight: PAS * 2 },
  selectionCard: {
    width: 230, minHeight: 112, padding: PAS * 4, borderRadius: RAYON.bloc,
    backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait, justifyContent: "space-between",
  },
  selectionCardActive: { borderColor: couleurs.encre, borderWidth: 1.5 },
  selectionTitre: { fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 17, lineHeight: 21, color: couleurs.encre, marginTop: PAS * 2 },
  detail: { gap: PAS * 4 },
  detailTitre: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 28, lineHeight: 32, color: couleurs.encre, letterSpacing: -0.4 },
  blocLecture: {
    backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 3, ...OMBRE,
  },
  phraseResultat: { fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 20, lineHeight: 26, color: couleurs.encre },
  resultat: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingTop: PAS * 2,
  },
  stat: { alignItems: "center", minWidth: 72, flex: 1 },
  statNombre: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 30, lineHeight: 34, color: couleurs.encre },
  statLibelle: { fontSize: 14, lineHeight: 19, color: couleurs.sourd, marginTop: 2 },
  statSep: { width: 1, height: 42, backgroundColor: couleurs.trait },
  groupes: {
    backgroundColor: couleurs.carte, borderRadius: RAYON.carte, overflow: "hidden",
    borderWidth: 1, borderColor: couleurs.trait,
  },
  groupe: { borderBottomWidth: 1, borderBottomColor: couleurs.trait },
  groupeTete: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: PAS * 4, paddingVertical: PAS * 3, gap: PAS * 3 },
  groupePoint: { width: 12, height: 12, borderRadius: 6 },
  groupeTexte: { flex: 1, gap: 2 },
  groupeNom: { fontSize: 16, lineHeight: 21, fontWeight: "700", color: couleurs.encre },
  groupeStats: { fontSize: 14, lineHeight: 19, color: couleurs.sourd },
  chevron: { fontSize: 24, lineHeight: 28, color: couleurs.sourd, width: 24, textAlign: "center" },
  positions: { borderTopWidth: 1, borderTopColor: couleurs.trait, paddingVertical: PAS * 2 },
  positionLigne: { minHeight: 46, flexDirection: "row", alignItems: "center", paddingHorizontal: PAS * 4, gap: PAS * 3 },
  positionNom: { flex: 1, fontSize: 15, lineHeight: 20, color: couleurs.encre },
  positionValeur: { fontSize: 14, lineHeight: 19, fontWeight: "700", color: couleurs.sourd },
  absence: { backgroundColor: couleurs.voile, borderRadius: RAYON.bloc, padding: PAS * 4, gap: PAS, },
  reponseBloc: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 3, ...OMBRE },
});
