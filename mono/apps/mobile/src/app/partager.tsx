/* « PARTAGER UN VOTE » — les deux cartes du canevas (13/10/2026).
 *
 * Carte 1 (canevas « Partage ») : l'annonce. Le nom, « a voté pour. » en grand,
 * le sujet, la date du scrutin, la commune. Elle donne envie de lire.
 * Carte 2 (canevas « Partage 2 ») : l'explication. Le texte, l'etape de la
 * procedure ou il se trouve, l'etape suivante, la source. Elle renvoie vers le
 * detail, sans prendre position.
 *
 * Les cartes ont les proportions du canevas (4 sur 5, comme 1080 sur 1350).
 * Chaque carte se partage en image PNG (react-native-view-shot), par la feuille
 * de partage du telephone ; le texte et le lien restent en repli.
 *
 * Tout vient des donnees de la commune et de @repere/core. Rien n'est ecrit a la
 * main : les exemples du canevas (nom, parti, loi, dates de promulgation) ne
 * figurent pas ici. Si le vote n'est pas publie, la carte n'existe pas. */
import { useRef, type RefObject } from "react";
import { Animated, Pressable, Share, Text, View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { chaineDecision, dateFr, etapeDuScrutin, ETAPES_LOI, jourParis, procedure, titreLisible } from "@repere/core";
import { couleurs, CIBLE, PAS, PALETTE_CLAIRE } from "../lib/theme";

/* Les cartes sont des images partagées hors de l'application : elles restent claires, quel que soit le thème du téléphone. */
const cl: Record<string, string> = PALETTE_CLAIRE;
import { srcVote } from "../lib/sources";
import { AvecDonnees, Page, Question } from "../ui/page";
import { useApparition } from "../ui/mouvement";

const VERBE: Record<string, string> = {
  p: "a voté pour.",
  c: "a voté contre.",
  a: "s'est abstenu.",
};

type Vote = { sc: { t: string; d: string; n: string }; position?: string; qui?: string };

/* Une carte devient une image PNG, puis la feuille de partage du telephone la
   transmet. Si la capture echoue, on partage le texte : le lecteur ne perd rien. */
async function partagerImage(carte: RefObject<View | null>, titre: string, repli: string) {
  try {
    const uri = await captureRef(carte, { format: "png", quality: 1, result: "tmpfile" });
    if (!(await Sharing.isAvailableAsync())) {
      await Share.share({ message: repli });
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: titre });
  } catch {
    await Share.share({ message: repli });
  }
}

/* Le logo du canevas : un carre encre, une lettre, le nom. */
function Logo({ c = couleurs }: { c?: Record<string, string> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.encre, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c.sol, fontWeight: "800", fontSize: 20 }}>R</Text>
      </View>
      <Text style={{ color: c.encre, fontWeight: "800", fontSize: 20, letterSpacing: -0.4 }}>Repère</Text>
    </View>
  );
}

export default function Partager() {
  const apparition = useApparition(0);
  const carte1 = useRef<View>(null);
  const carte2 = useRef<View>(null);
  const { width } = useWindowDimensions();
  /* Une carte occupe la largeur de l'ecran, moins les marges ; jamais plus de 420 px. */
  const largeur = Math.min(width - PAS * 10, 420);
  const echelle = largeur / 380;
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const vote = d.dernierVote as Vote | undefined;
      if (!vote || !vote.position || !VERBE[vote.position]) {
        return (
          <Page>
            <Stack.Screen options={{ title: "Partager" }} />
            <Question etiquette="Partager" question="Rien à partager pour l'instant"
              sous="Repère n'a pas de vote publié à partager pour votre député. Le partage n'invente rien." />
          </Page>
        );
      }
      const niveaux = chaineDecision({ fiche: d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as { echelon: string; personne?: { nom: string } | null }[];
      const nom = niveaux.find(n => n.echelon === "france")?.personne?.nom || "Votre député";
      const verbe = VERBE[vote.position];
      const sujet = titreLisible(vote.sc.t);
      const date = dateFr(vote.sc.d);
      const aujourdhui = dateFr(jourParis(new Date()));
      const etape = etapeDuScrutin(procedure(vote.sc.t));
      const idx = ETAPES_LOI.findIndex(e => e.cle === etape);
      const jalon = idx >= 0 ? ETAPES_LOI[idx] : undefined;
      const suite = idx >= 0 && idx < ETAPES_LOI.length - 1 ? ETAPES_LOI[idx + 1] : undefined;
      const lienScrutin = srcVote(d, vote.sc)?.url || null;
      const ou = jalon
        ? `Où en est le texte : ${jalon.titre.toLowerCase()}. ${jalon.texte}`
        : "Le scrutin ne précise pas l'étape du texte : Repère ne la devine pas.";

      const lignes = [
        `${nom} ${verbe}`,
        sujet,
        `Vote à l'Assemblée nationale, ${date}.`,
        "",
        ou,
        "",
        "Résumé Repère, à partir du scrutin publié. Le détail est dans l'application.",
      ];
      if (lienScrutin) lignes.push(lienScrutin);
      const message = lignes.join("\n");

      return (
        <Page>
          <Stack.Screen options={{ title: "Partager" }} />
          <Animated.View style={{ opacity: apparition, gap: PAS * 4 }}>
            <Question etiquette="Partager ce vote" question="Deux cartes, à lire dans l'ordre" />

            {/* CARTE 1 — L'ANNONCE (canevas « Partage ») */}
            <View ref={carte1} collapsable={false} accessible
              accessibilityLabel={`${nom} ${verbe} ${sujet}. Vote à l'Assemblée nationale, ${date}.`}
              style={{ width: largeur, aspectRatio: 0.8, alignSelf: "center", backgroundColor: cl.sol,
                borderRadius: 18 * echelle, padding: 28 * echelle, justifyContent: "space-between" }}>
              <Logo c={cl} />
              <View style={{ gap: 10 * echelle }}>
                <Text style={{ color: cl.encre, fontWeight: "800", fontSize: 26 * echelle, lineHeight: 30 * echelle, letterSpacing: -0.5 }}>{nom}</Text>
                <Text style={{ color: cl.encre, fontWeight: "800", fontSize: 50 * echelle, lineHeight: 52 * echelle, letterSpacing: -2 * echelle }}>{verbe}</Text>
              </View>
              <View style={{ gap: 12 * echelle }}>
                <Text style={{ color: cl.encre, fontWeight: "800", fontSize: 22 * echelle, lineHeight: 27 * echelle, letterSpacing: -0.3 }}>{sujet}</Text>
                <Text style={{ color: cl.sourd, fontSize: 14 * echelle, lineHeight: 19 * echelle }}>Vote à l'Assemblée nationale, {date}.</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: PAS * 2 }}>
                <Text style={{ color: cl.sourd, fontSize: 12 * echelle, lineHeight: 16 * echelle, flex: 1 }}>Résumé Repère, à partir du scrutin publié. Le détail est dans l'application.</Text>
                <Text style={{ color: cl.encre, fontWeight: "800", fontSize: 18 * echelle }}>{d.nomCommune}</Text>
              </View>
            </View>

            {/* CARTE 2 — L'EXPLICATION (canevas « Partage 2 ») */}
            <View ref={carte2} collapsable={false} accessible
              accessibilityLabel={`Comment ce texte avance. ${ou}`}
              style={{ width: largeur, aspectRatio: 0.8, alignSelf: "center", backgroundColor: cl.sol,
                borderRadius: 18 * echelle, padding: 28 * echelle, justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Logo c={cl} />
                <Text style={{ fontWeight: "700", fontSize: 12 * echelle, borderWidth: 2, borderColor: cl.encre, borderRadius: 999, paddingHorizontal: 10 * echelle, paddingVertical: 4 * echelle, color: cl.encre }}>Explication</Text>
              </View>

              <View style={{ gap: 8 * echelle }}>
                <Text style={{ color: cl.encre, fontWeight: "800", fontSize: 26 * echelle, lineHeight: 29 * echelle, letterSpacing: -0.7 }}>{sujet}</Text>
                <Text style={{ color: cl.sourd, fontSize: 13 * echelle, lineHeight: 18 * echelle }}>Où en est le texte, selon la procédure</Text>
              </View>

              {/* Le schema : le vote, la place du texte, la suite. Les liaisons sont des traits, comme sur le canevas. */}
              <View style={{ gap: 0 }}>
                <View style={{ minHeight: 44 * echelle, borderWidth: 2, borderColor: cl.encre, borderRadius: 14 * echelle,
                  paddingHorizontal: 14 * echelle, justifyContent: "center" }}>
                  <Text style={{ fontWeight: "800", fontSize: 14 * echelle, color: cl.encre }}>Vote à l'Assemblée nationale, {date}</Text>
                </View>
                <View style={{ height: 22 * echelle, width: 2, backgroundColor: cl.encre, marginLeft: 22 * echelle }} />
                <View style={{ borderRadius: 14 * echelle, backgroundColor: cl.encre, padding: 14 * echelle, gap: 6 * echelle }}>
                  <Text style={{ fontWeight: "800", fontSize: 17 * echelle, lineHeight: 21 * echelle, color: cl.sol }}>
                    {jalon ? jalon.titre : "Étape non précisée"}
                  </Text>
                  <Text style={{ fontSize: 12 * echelle, lineHeight: 16 * echelle, color: cl.trait }}>
                    {jalon ? jalon.texte : "Le scrutin ne précise pas l'étape du texte : Repère ne la devine pas."}
                  </Text>
                </View>
                {suite ? (
                  <>
                    <View style={{ height: 22 * echelle, width: 2, backgroundColor: cl.encre, marginLeft: 22 * echelle }} />
                    <View style={{ minHeight: 44 * echelle, borderWidth: 2, borderColor: cl.encre, borderRadius: 14 * echelle,
                      paddingHorizontal: 14 * echelle, justifyContent: "center" }}>
                      <Text style={{ fontWeight: "800", fontSize: 14 * echelle, color: cl.encre }}>Suite : {suite.titre}</Text>
                    </View>
                  </>
                ) : null}
              </View>

              <View style={{ gap: 6 * echelle }}>
                <Text style={{ color: cl.sourd, fontSize: 12 * echelle, lineHeight: 16 * echelle }}>
                  Source : Assemblée nationale, scrutin n° {vote.sc.n}, {date}.
                </Text>
                <Text style={{ color: cl.sourd, fontSize: 12 * echelle, lineHeight: 16 * echelle }}>
                  Résumé Repère du {aujourdhui}. Le texte officiel fait foi.
                </Text>
              </View>
            </View>

            <View style={{ gap: PAS * 2 }}>
              <Pressable onPress={() => partagerImage(carte1, "Carte 1 : l'annonce", message)} accessibilityRole="button"
                accessibilityLabel="Partager la carte 1 en image"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
                  alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: couleurs.sol, fontWeight: "700" }}>Partager la carte 1 (image)</Text>
              </Pressable>
              <Pressable onPress={() => partagerImage(carte2, "Carte 2 : pour comprendre", message)} accessibilityRole="button"
                accessibilityLabel="Partager la carte 2 en image"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
                  alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: couleurs.sol, fontWeight: "700" }}>Partager la carte 2 (image)</Text>
              </Pressable>
              <Pressable onPress={() => Share.share({ message })} accessibilityRole="button"
                accessibilityLabel="Partager le texte et le lien par la feuille de partage du téléphone"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
                  backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.6 : 1 })}>
                <Text style={{ color: couleurs.encre, fontWeight: "700" }}>Partager le texte et le lien</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Page>
      );
    }} />
  );
}
