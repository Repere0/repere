/* EXPLORER DES SCRUTINS PUBLICS — totalité de la XVIIe législature.
 *
 * L'index contient tous les scrutins publics ; le détail nominatif est chargé
 * par lot de 64 au clic. Cela évite un téléchargement massif à l'ouverture.
 *
 * Les couleurs identifient visuellement les groupes uniquement. Elles ne
 * codent jamais la position du vote : Pour / Contre / Abstention restent
 * textuels et identiques pour tous.
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { chargerQuestionsGouvernementIndex, chargerQuestionGouvernementLot, chargerScrutinsIndex, chargerScrutinLot, ETATS } from "../lib/donnees";
import { Page } from "../ui/page";
import { Vide } from "../lib/composants";
import { PastilleSource } from "../ui/source";
import { PAS, TYPO, couleurs, CIBLE, RAYON } from "../lib/theme";
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
const resultat = (x: Resume) =>
  [x.dec.pour != null ? `${x.dec.pour} pour` : null,
   x.dec.contre != null ? `${x.dec.contre} contre` : null,
   x.dec.abstentions != null ? `${x.dec.abstentions} abstention${Number(x.dec.abstentions) > 1 ? "s" : ""}` : null]
    .filter(Boolean).join(" · ");

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
      : index.scrutins.slice(-24);
    return source.slice().reverse();
  }, [index, recherche]);

  const choisir = (n: string) => {
    setSelection(n);
    setDetail(null);
    setOuverts(new Set());
  };
  const qagVisibles = useMemo(() => {
    if (!qagIndex) return [];
    const q = qagRecherche.trim().toLocaleLowerCase("fr");
    const source = q
      ? qagIndex.questions.filter(x => (x.n + " " + (x.auteur.nom || "") + " " + (x.ministere || "")).toLocaleLowerCase("fr").includes(q))
      : qagIndex.questions.slice(-24);
    return source.slice().reverse();
  }, [qagIndex, qagRecherche]);

  return (
    <Page>
      <Stack.Screen options={{ title: "Scrutins publics" }} />
      <Text style={TYPO.affiche}>Les votes de l'Assemblée</Text>
      <Text style={TYPO.note}>
        {index ? `${index.total_publics.toLocaleString("fr-FR")} scrutins publics de la XVIIe législature, avec les positions individuelles publiées.`
          : "Les scrutins publics de la XVIIe législature, avec les positions individuelles publiées."}
      </Text>

      <View style={{ flexDirection: "row", gap: PAS * 2 }}>
        <Pressable onPress={() => setMode("votes")} accessibilityRole="button" style={{ minHeight: CIBLE, flex: 1, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: mode === "votes" ? couleurs.voile : couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
          <Text style={{ fontWeight: "700", color: couleurs.encre }}>Votes publics</Text>
        </Pressable>
        <Pressable onPress={() => setMode("qag")} accessibilityRole="button" style={{ minHeight: CIBLE, flex: 1, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: mode === "qag" ? couleurs.voile : couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
          <Text style={{ fontWeight: "700", color: couleurs.encre }}>Questions au Gouvernement</Text>
        </Pressable>
      </View>

      {mode === "qag" ? (
        !qagIndex ? (
          <Vide titre="Chargement des questions au Gouvernement." corps="Repère récupère le relevé officiel des séances de questions." />
        ) : (
          <>
            <Text style={TYPO.note}>{qagIndex.total.toLocaleString("fr-FR")} questions au Gouvernement dans le relevé officiel.</Text>
            <TextInput
              value={qagRecherche}
              onChangeText={setQagRecherche}
              placeholder="Rechercher un député ou un ministère"
              placeholderTextColor={couleurs.sourd}
              accessibilityLabel="Rechercher une question au Gouvernement"
              style={{ minHeight: CIBLE, borderWidth: 1, borderColor: couleurs.trait, borderRadius: RAYON.bloc, paddingHorizontal: PAS * 3, color: couleurs.encre, backgroundColor: couleurs.carte }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}>
              {qagVisibles.map(x => (
                <Pressable key={x.uid} onPress={() => { setQagSelection(x.uid); setQagDetail(null); }} accessibilityRole="button"
                  style={{ minHeight: CIBLE, minWidth: 150, maxWidth: 210, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: x.uid === qagSelection ? couleurs.voile : couleurs.carte, borderWidth: 1, borderColor: couleurs.trait, borderLeftWidth: 5, borderLeftColor: x.groupe.couleur }}>
                  <Text style={TYPO.micro}>{x.d ? dateFr(x.d) : "Date non fournie"}</Text>
                  <Text style={{ fontWeight: "700", color: couleurs.encre }}>Question n° {x.n}</Text>
                  <Text numberOfLines={2} style={TYPO.note}>{x.auteur.nom || "Auteur non identifié"} · {x.ministere || "Ministère non précisé"}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {chargementQag ? <Vide titre="Chargement de la question." corps="Repère récupère le contenu publié par l'Assemblée nationale." /> : qagDetail ? (
              <View style={{ gap: PAS * 3 }}>
                <Text style={TYPO.question}>Question n° {qagDetail.n}</Text>
                <Text style={TYPO.note}>{qagDetail.auteur.nom || "Auteur non identifié"} · {qagDetail.groupe.nom}</Text>
                <Text style={TYPO.note}>Ministère : {qagDetail.ministere || "non précisé"}</Text>
                {qagDetail.question ? <View style={{ gap: PAS }}><Text style={TYPO.micro}>QUESTION</Text><Text style={TYPO.corps}>{qagDetail.question}</Text></View>
                  : <Vide titre="Le texte de la question n'est pas fourni dans ce relevé." corps="Repère ne le reconstruit pas à partir d'une autre source." />}
                {qagDetail.reponse ? <View style={{ gap: PAS }}><Text style={TYPO.micro}>RÉPONSE DU GOUVERNEMENT</Text><Text style={TYPO.corps}>{qagDetail.reponse}</Text></View>
                  : <Vide titre="Aucune réponse textuelle fournie dans ce relevé." corps="Cela ne signifie pas qu'il n'y a pas eu de réponse : Repère ne l'invente pas." />}
                <PastilleSource court source={{ producteur: qagIndex.source.producteur_affiche, licence: qagIndex.source.licence, url: qagDetail.url, releve: qagIndex.source.releve_le, usage: "Repère reprend les informations publiées par l'Assemblée nationale pour cette Question au Gouvernement." }} />
              </View>
            ) : null}
          </>
        )
      ) : (\n        {!index ? (
        <Vide
          titre={etat === ETATS.EN_COURS ? "Chargement des scrutins." : "Les scrutins ne sont pas disponibles."}
          corps="Repère n'affiche pas une position quand le relevé détaillé n'est pas disponible."
        />
      ) : (
        <>
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Rechercher un numéro ou un texte"
            placeholderTextColor={couleurs.sourd}
            accessibilityLabel="Rechercher un scrutin"
            style={{
              minHeight: CIBLE, borderWidth: 1, borderColor: couleurs.trait,
              borderRadius: RAYON.bloc, paddingHorizontal: PAS * 3,
              color: couleurs.encre, backgroundColor: couleurs.carte,
            }}
          />

          <Text style={TYPO.micro}>
            {recherche ? `${visibles.length} résultat${visibles.length > 1 ? "s" : ""}` : "Les 24 derniers scrutins · recherchez pour parcourir toute l'archive"}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}>
            {visibles.map(x => (
              <Pressable
                key={x.n}
                onPress={() => choisir(x.n)}
                accessibilityRole="button"
                accessibilityLabel={`Scrutin n°${x.n}, ${dateFr(x.d)}`}
                style={{
                  minHeight: CIBLE, minWidth: 140, maxWidth: 190, padding: PAS * 3,
                  borderRadius: RAYON.bloc, backgroundColor: x.n === selection ? couleurs.voile : couleurs.carte,
                  borderWidth: 1, borderColor: couleurs.trait,
                }}
              >
                <Text style={TYPO.micro}>{dateFr(x.d)}</Text>
                <Text style={{ fontWeight: "700", color: couleurs.encre }}>n° {x.n}</Text>
                <Text numberOfLines={2} style={TYPO.note}>{x.t}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {chargementDetail ? (
            <Vide titre="Chargement du vote." corps="Repère récupère le détail nominatif de ce scrutin." />
          ) : detail ? (
            <View style={{ gap: PAS * 3 }}>
              <Text style={TYPO.question}>{titreLisible(detail.t)}</Text>
              <Text style={TYPO.note}>{detail.ty} · {dateFr(detail.d)} · scrutin n° {detail.n}</Text>
              <Text style={TYPO.corps}>{resultat(detail)}</Text>

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
                      accessibilityLabel={`${g.nom}, ${g.positions.length} positions publiées`}
                      style={{ minHeight: CIBLE, padding: PAS * 3, justifyContent: "center", borderLeftWidth: 5, borderLeftColor: g.couleur }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                        <View accessibilityElementsHidden style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: g.couleur }} />
                        <Text style={{ flex: 1, fontWeight: "700", color: couleurs.encre }}>{g.nom}</Text>
                      </View>
                      <Text style={TYPO.note}>
                        {[g.pour != null ? `${g.pour} pour` : null, g.contre != null ? `${g.contre} contre` : null, g.abstentions != null ? `${g.abstentions} abstention${g.abstentions > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ")}
                      </Text>
                      <Text style={[TYPO.micro, { marginTop: PAS }]}>
                        {ouvert ? "Masquer les députés" : "Voir les députés"}
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
      )}
      )}
    </Page>
  );
}
