/* POUR VOUS — le fil chronologique, filtré par la vue (V29, bloc 6).
 *
 * Ce qu'il montre, et d'où cela vient. Rien d'autre n'est ajouté :
 *   - les scrutins publiés à l'Assemblée (catalogue), echelon « france » ;
 *   - les faits de la rédaction (evenements.json), hors scrutins déjà comptés ; echelon de l'enregistrement ;
 *   - les comptes de la commune retenue, dernier exercice publié ; echelon « ville ».
 * Les échéances (calendrier des séances) ne sont pas dans ce fil : c'est un calendrier de
 * séances à venir, pas une liste de nouveautés. Écart noté dans le rapport V29.
 *
 * Règles :
 *   - « Cette semaine » : les entrées datées de moins de 7 jours ;
 *   - un exercice de comptes n'est pas daté au jour : il n'est jamais « cette semaine » ;
 *   - le filtre de vue est visibleAuNiveau, la même règle que le reste de l'application ;
 *   - rien n'est supprimé : « Voir plus » déroule les anciennes entrées par tranches. */
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";
import { ageReleve, dateFr, dernierExercice, parHabitant, titreLisible, visibleAuNiveau } from "@repere/core";
import { chargerCatalogueScrutins, chargerCommunesBeta, chargerDepartement, chargerEvenements, chargerIndex } from "../lib/donnees";
import { srcComptesPublies, srcVote } from "../lib/sources";
import { useSelection } from "../lib/selection";
import { useProfil } from "../lib/profil";
import { Vide } from "../lib/composants";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";
import { BadgeZoom, useNiveauZoom } from "../ui/badge-zoom";
import { ilYa } from "../ui/fraicheur";
import { SquelettesListe } from "../ui/squelette";

const JOURS_SEMAINE = 7;
const PAR_TRANCHE = 10;

type Entree = {
  cle: string; echelon: string; d: string | null; an: string | null;
  quoi: string; icone: string; titre: string; lien: string | null; source: string;
};

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

/* Plus récent en premier ; les entrées sans date au jour (exercices de comptes) en dernier. */
function ordonner(a: Entree, b: Entree): number {
  if (a.d && b.d) return a.d < b.d ? 1 : a.d > b.d ? -1 : a.cle < b.cle ? 1 : -1;
  if (a.d) return -1;
  if (b.d) return 1;
  return a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0;
}

const ageDe = (e: Entree): number | null => (e.d ? ageReleve(e.d) : null);
const estCetteSemaine = (e: Entree): boolean => {
  const g = ageDe(e);
  return g !== null && g >= 0 && g < JOURS_SEMAINE;
};

export default function PourVous() {
  const niveau = useNiveauZoom();
  const { modifier } = useProfil();
  const { choix, retenue } = useSelection();
  const [nationales, setNationales] = useState<Entree[] | null>(null);
  const [budget, setBudget] = useState<Entree | null>(null);
  const [echec, setEchec] = useState(false);
  const [tranches, setTranches] = useState(1);

  useEffect(() => {
    let vivant = true;
    Promise.all([chargerCatalogueScrutins(), chargerEvenements()]).then(([c, e]) => {
      if (!vivant) return;
      if (!c.donnees && !e.donnees) { setEchec(true); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cat = c.donnees as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ev = e.donnees as any;
      const scrutins: Entree[] = ((cat?.scrutins as { n: string; d: string; t: string }[]) || [])
        .filter(x => DATE_ISO.test(x.d))
        .map(x => ({
          cle: "s" + x.n, echelon: "france", d: x.d, an: null, quoi: "Vote à l'Assemblée", icone: "⚖",
          titre: titreLisible(x.t), lien: srcVote(cat, x)?.url ?? null, source: "Assemblée nationale",
        }));
      const faits: Entree[] = ((ev?.r as { id: string; d: string; t: string; e: string; src?: string; srcn?: string }[]) || [])
        /* Les faits qui sont aussi des scrutins ne sont pas comptés deux fois. */
        .filter(x => DATE_ISO.test(x.d) && !x.id.startsWith("scrutin-"))
        .map(x => ({
          cle: "e" + x.id, echelon: x.e, d: x.d, an: null, quoi: "Fait publié", icone: "✎",
          titre: x.t, lien: x.src ?? null, source: x.srcn ?? "Repère (rédaction)",
        }));
      setNationales([...scrutins, ...faits]);
    }).catch(() => { if (vivant) setEchec(true); });
    return () => { vivant = false; };
  }, []);

  /* Les comptes de la commune : la commune choisie, sinon la commune retenue sur ce téléphone.
     Même lecture que la carte budget de l'accueil (dernier exercice, par habitant, publié tel quel). */
  useEffect(() => {
    let vivant = true;
    const dep = choix?.dep ?? retenue?.d ?? null;
    const insee = choix?.insee ?? retenue?.c ?? null;
    if (!dep || !insee) { setBudget(null); return undefined; }
    Promise.all([chargerIndex(), chargerDepartement(dep), chargerCommunesBeta()]).then(([ix, pq, bt]) => {
      if (!vivant) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nom: string | undefined = choix?.nom ?? (bt.donnees as any)?.communes?.[insee];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fiche = (pq.donnees as any)?.communes?.[insee];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ex = fiche && ix.donnees ? dernierExercice(fiche, (ix.donnees as any).agregats) : null;
      const hab = ex ? parHabitant(ex.ex) : null;
      if (!nom || !ex || !hab || typeof hab.depenses !== "number") { setBudget(null); return; }
      setBudget({
        cle: "budget", echelon: "ville", d: null, an: ex.an, quoi: "Comptes de la commune", icone: "€",
        titre: `${nom} : ${Math.round(hab.depenses).toLocaleString("fr-FR")} € de dépenses par habitant en ${ex.an}`,
        lien: srcComptesPublies(pq.donnees)?.url ?? null, source: "OFGL",
      });
    }).catch(() => { if (vivant) setBudget(null); });
    return () => { vivant = false; };
  }, [choix, retenue]);

  const visibles = useMemo(
    () => [...(budget ? [budget] : []), ...(nationales ?? [])].filter(e => visibleAuNiveau(niveau, e.echelon)).sort(ordonner),
    [budget, nationales, niveau],
  );
  const recentes = visibles.filter(estCetteSemaine);
  const anciennes = visibles.filter(e => !estCetteSemaine(e));
  const montrees = anciennes.slice(0, tranches * PAR_TRANCHE);
  const restantes = anciennes.length - montrees.length;

  return (
    <Page sansDate>
      <BadgeZoom />
      <Question etiquette="Selon votre vue" question="Pour vous" sous="Ce qui a été publié, du plus récent au plus ancien." />
      {echec ? <Vide titre="Les publications ne sont pas disponibles pour le moment." /> : null}
      {!echec && nationales === null ? <SquelettesListe n={3} hauteur={96} /> : null}
      {!echec && nationales !== null && visibles.length === 0 ? (
        <Vide
          titre={niveau === "rue" ? "Pas d'actu locale." : "Rien à montrer pour cette vue."}
          action={niveau === "france" ? undefined : "Voir la France"}
          onAction={() => modifier({ niveauZoom: "france" })}
        />
      ) : null}
      {!echec && nationales !== null && visibles.length > 0 ? (
        <View style={{ gap: PAS * 4 }}>
          <View style={{ gap: PAS * 3 }}>
            <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">Cette semaine</Text>
            {recentes.length === 0 ? (
              <Vide titre="Rien de nouveau cette semaine." action="Voir les archives" onAction={() => router.push("/actus")} />
            ) : recentes.map(e => <Ligne key={e.cle} e={e} />)}
          </View>
          {anciennes.length > 0 ? (
            <View style={{ gap: PAS * 3 }}>
              <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">Plus anciennes</Text>
              {montrees.map(e => <Ligne key={e.cle} e={e} />)}
              {restantes > 0 ? (
                <Pressable onPress={() => setTranches(t => t + 1)} accessibilityRole="button"
                  accessibilityLabel={`Voir plus de publications. ${restantes} restantes.`}
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
                  <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "700" }]}>Voir plus ({restantes} de plus)</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </Page>
  );
}

function Ligne({ e }: { e: Entree }) {
  const g = ageDe(e);
  const quand = e.d
    ? `${dateFr(e.d)}${g !== null && g >= 0 ? ` · ${ilYa(g)}` : ""}`
    : `Comptes publiés pour ${e.an}`;
  const contenu = (
    <View style={{ gap: PAS }}>
      <Text style={[TYPO.note, { color: couleurs.sourd }]}>{e.icone} {e.quoi} · {quand}</Text>
      <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]}>{e.titre}</Text>
      <Text style={[TYPO.note, { color: couleurs.sourd }]}>Source : {e.source}</Text>
    </View>
  );
  if (!e.lien) return <View style={{ paddingVertical: PAS * 2 }}>{contenu}</View>;
  return (
    <Pressable onPress={() => Linking.openURL(e.lien as string)} accessibilityRole="link"
      accessibilityLabel={`${e.quoi} : ${e.titre}. Source : ${e.source}. Ouvre un site externe.`}
      style={({ pressed }) => ({ minHeight: CIBLE, paddingVertical: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
      {contenu}
    </Pressable>
  );
}
