/* MES ÉLUS — la vue compacte des élus de votre commune (V30, bloc 1).
 *
 * Même source que « Qui décide » (chaineDecision, @repere/core) et même fichier de département pour les
 * conseillers départementaux : aucune donnée nouvelle. Ce qui n'est pas dans les données de Repère est dit
 * tel quel : les sénateurs et les conseillers régionaux n'y figurent pas.
 * Une ligne ouvre la fiche quand la fiche sait la retrouver (maire, député). */
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { chaineDecision } from "@repere/core";
import { AvecDonnees, Page, Question } from "../ui/page";
import { BadgeZoom } from "../ui/badge-zoom";
import { SignalerErreur } from "../ui/contact";
import { BoutonPartageTexte, ligneSource } from "../ui/partage/partager-texte";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";

type Personne = { nom: string; role?: string };
type Groupe = { titre: string; lignes: { cle: string; nom: string; detail: string; ouvrir?: () => void }[]; note?: string };

export default function MesElus() {
  return (
    <AvecDonnees rendu={r => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f: any = r.d.fiche;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const brut: any[] = chaineDecision({ fiche: f, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: r.d.dep });
      const niveau = (e: string) => brut.find(n => n.echelon === e);

      const ville = niveau("ville");
      const france = niveau("france");
      const ouvrir = (n: { personne?: Personne; echelon: string; niveau: string; institution: string; lieu?: string }) => () =>
        router.push({ pathname: "/elu", params: {
          nom: n.personne ? n.personne.nom : "", role: n.personne?.role ?? "", echelon: n.echelon,
          niveau: n.niveau, institution: n.institution, lieu: n.lieu ?? "" } });

      /* Conseillers départementaux du canton : le fichier du département porte le canton de chaque conseiller. */
      const cantons: number[] = (Array.isArray(f?.canton) ? f.canton : f?.canton != null ? [f.canton] : []).map(Number);
      const conseil: { nom: string; fonction?: string; canton?: number }[] = (r.paquet as any)?.conseil_departemental ?? [];
      const duCanton = conseil.filter(c => cantons.includes(Number(c.canton)));

      const groupes: Groupe[] = [
        {
          titre: "Maire",
          lignes: ville?.personne
            ? [{ cle: "maire", nom: ville.personne.nom, detail: ville.personne.role ?? "Maire", ouvrir: ouvrir(ville) }]
            : [],
          note: ville?.personne ? undefined : "Le Répertoire national des élus ne porte pas de maire pour cette commune.",
        },
        {
          titre: "Député",
          lignes: france?.personne
            ? [{ cle: "depute", nom: france.personne.nom, detail: france.personne.role ?? "Député", ouvrir: ouvrir(france) }]
            : [],
          note: france?.personne ? undefined : (france?.note ?? "Aucun député n'est désigné pour cette commune."),
        },
        {
          titre: "Sénateurs",
          lignes: [],
          note: "Les sénateurs de votre département ne figurent pas dans les données publiées par Repère. Le site du Sénat les liste.",
        },
        {
          titre: "Conseillers départementaux de votre canton",
          lignes: duCanton.map((c, i) => ({ cle: "cd" + i, nom: c.nom, detail: c.fonction ?? "Conseiller départemental" })),
          note: cantons.length === 0
            ? "Le canton de votre commune n'est pas dans les données publiées."
            : duCanton.length === 0
              ? "Aucun conseiller départemental de ce canton n'est porté par le fichier du département."
              : undefined,
        },
        {
          titre: "Conseillers régionaux",
          lignes: [],
          note: "Les conseillers régionaux ne figurent pas dans les données publiées par Repère. Seul l'exécutif de chaque région est publié.",
        },
      ];

      return (
        <Page>
          <Stack.Screen options={{ title: "Mes élus", headerRight: () => <BoutonPartageTexte titre={`Mes élus à ${r.d.nomCommune}`} chemin="mes-elus" source={ligneSource(r.srcElus)} /> }} />
          <BadgeZoom />
          <Question etiquette="Vos élus" question={`Qui vous représente à ${r.d.nomCommune} ?`}
            sous="Les élus de votre commune, du plus proche au plus lointain. Touchez une ligne pour sa fiche." />
          <View style={{ gap: PAS * 4 }}>
            {groupes.map(g => (
              <View key={g.titre} style={{ gap: PAS * 2 }}>
                <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">{g.titre}</Text>
                {g.lignes.map(l => l.ouvrir ? (
                  <Pressable key={l.cle} onPress={l.ouvrir} accessibilityRole="button"
                    accessibilityLabel={`${g.titre} : ${l.nom}, ${l.detail}. Ouvrir la fiche.`}
                    style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                    <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.lien }]}>{l.nom}</Text>
                    <Text style={[TYPO.note, { color: couleurs.sourd }]}>{l.detail} ›</Text>
                  </Pressable>
                ) : (
                  <View key={l.cle} style={{ minHeight: CIBLE, justifyContent: "center" }}>
                    <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]}>{l.nom}</Text>
                    <Text style={[TYPO.note, { color: couleurs.sourd }]}>{l.detail}</Text>
                  </View>
                ))}
                {g.note ? <Text style={[TYPO.note, { color: couleurs.sourd }]}>{g.note}</Text> : null}
              </View>
            ))}
          </View>
          <SignalerErreur contexte={`Mes élus de ${r.d.nomCommune}`}
            donnee={groupes.flatMap(g => g.lignes.map(l => `${g.titre} : ${l.nom}`)).join(" ; ")} />
        </Page>
      );
    }} />
  );
}
