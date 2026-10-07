/* « D'OÙ VIENNENT CES INFORMATIONS ? » — 30/09/2026.
 *
 * La derniere etape de la progression : « Où est-ce que je peux vérifier ? ».
 * Chaque source, ce que Repere en tire, et DEUX dates distinctes : celle de la
 * source (publiee, ou relevee pour l'Assemblee) et celle ou Repere a traite
 * les fichiers. Ne jamais les confondre. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { dateFr, datePublication, LIBELLES } from "@repere/core";
import { Carte, LienSortant } from "../lib/composants";
import { PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";

type Ligne = { quoi: string; producteur?: string; maj?: string; releve?: string; url?: string; usage: string };

export default function Sources() {
  return (
    <AvecDonnees rendu={r => {
      const s = (r.index && r.index.sources) || {};
      const d = r.d;
      const lignes: Ligne[] = [
        { quoi: "Les élus", ...pick(s.elus), usage: "Le maire, les adjoints, l'intercommunalité, le département et la région." },
        { quoi: "Les comptes de la commune", ...pick(s.comptes), usage: "Ce que la commune dépense, encaisse et doit ; Repère en tire des parts « sur 100 € », annoncées comme des calculs." },
        { quoi: "Les projets aidés par l'État", ...pick(d.srcProjets ? { ...d.srcProjets, maj: d.srcProjets.mis_a_jour_le } : s.projets), usage: "L'aide de l'État et le coût annoncé de chaque projet." },
        { quoi: "Les votes de l'Assemblée", ...pick(d.srcScrutins ? { ...d.srcScrutins, releve: d.srcScrutins.releve_le } : null), usage: "La position de votre député et le décompte de chaque vote, tels que l'Assemblée les publie." },
        { quoi: "Les Questions au Gouvernement", ...pick(s.questionsGouvernement), usage: "Les questions posées au Gouvernement et les réponses publiées par l'Assemblée nationale." },
        { quoi: "Les circonscriptions", ...pick(s.circonscriptions), usage: "À quelle circonscription appartient la commune (découpage de 2010)." },
      ].filter(l => l.producteur);
      const traite = datePublication(r.index);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.sources }} />
          <Question etiquette="Sources" question="D'où viennent ces informations ?"
            sous={traite ? `Repère a traité ces fichiers le ${dateFr(traite)}. Chaque source a sa propre date, écrite ci-dessous : c'est celle de la donnée.` : undefined} />
          {lignes.map(l => (
            <Carte key={l.quoi} titre={l.quoi}>
              <Text style={[TYPO.corps, { fontWeight: "700" }]}>{l.producteur}</Text>
              {l.maj ? <Text style={TYPO.note}>Données publiées le {dateFr(l.maj)}</Text>
                : l.releve ? <Text style={TYPO.note}>Données relevées le {dateFr(l.releve)}</Text> : null}
              <Text style={TYPO.corps}>{l.usage}</Text>
              {l.url ? <View style={{ marginTop: PAS }}><LienSortant url={l.url} texte="Voir la donnée originale" etiquette={`Voir la donnée originale : ${l.quoi}`} /></View> : null}
            </Carte>
          ))}
          <Text style={TYPO.note}>Aucune donnée n'est modifiée. Quand Repère calcule, il le dit, à côté du chiffre.</Text>
        </Page>
      );
    }} />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick(x: any): { producteur?: string; maj?: string; releve?: string; url?: string } {
  if (!x) return {};
  return { producteur: x.producteur, maj: x.maj, releve: x.releve || x.releve_le, url: x.url };
}
