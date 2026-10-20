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
import { couleurs, PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { Depli } from "../ui/visuels";

type Ligne = { quoi: string; producteur?: string; licence?: string; maj?: string; releve?: string; url?: string; usage: string };

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
        /* 08/10/2026 (audit) : le nom du depute vient d'un autre fichier que ses votes ; il manquait ici */
        { quoi: "Les noms des députés", ...pick(s.deputes), usage: "Le nom de votre député et sa circonscription, tels que l'Assemblée les publie." },
      ].filter(l => l.producteur);
      const traite = datePublication(r.index);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.sources }} />
          <Question question="D'où viennent ces informations ?"
            sous={traite ? `Repère a traité ces fichiers le ${dateFr(traite)}. Chaque source a sa propre date, écrite ci\u2011dessous\u00a0: c'est celle de la donnée.` : undefined} />
          {/* Au premier niveau : qui publie, quand, et le lien vers la donnée.
             La licence et l'usage que Repère en fait se déplient (16/10/2026). */}
          {/* DENSITE (16/10/2026) : une seule carte, une ligne par source (etait une
             carte par source : 2,7 hauteurs d'ecran). Memes phrases, memes dates. */}
          <Carte>
            {lignes.map((l, i) => (
              <View key={l.quoi} style={{ gap: 2, paddingTop: i ? PAS * 3 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: couleurs.trait }}>
                <Text style={[TYPO.corps, { fontWeight: "800" }]} accessibilityRole="header">{l.quoi}</Text>
                <Text style={TYPO.note}>{l.producteur}</Text>
                {l.maj ? <Text style={TYPO.note}>Données publiées le {dateFr(l.maj)}</Text>
                  : l.releve ? <Text style={TYPO.note}>Données relevées le {dateFr(l.releve)}</Text>
                  : <Text style={TYPO.note}>Ce fichier ne porte pas de date de publication que Repère puisse afficher.</Text>}
                {l.url ? <LienSortant url={l.url} texte="Voir la donnée originale" etiquette={`Voir la donnée originale : ${l.quoi}`} /> : null}
                {/* Titre visible court, sur une ligne ; le nom de la source, avec ses majuscules
                    (« l'État », « l'Assemblée »), est dans le nom lu (16/10/2026 : toLowerCase
                    ecrivait « projets aidés par l'état »). */}
                <Depli titre={`Ce que Repère en tire${l.licence ? " et sa licence" : ""}`}
                  etiquette={`Ce que Repère en tire${l.licence ? " et sa licence" : ""} : ${l.quoi}`}>
                  <Text style={TYPO.corps}>{l.usage}</Text>
                  {l.licence ? <Text style={TYPO.note}>Licence : {l.licence}</Text> : null}
                </Depli>
              </View>
            ))}
          </Carte>
          <Text style={TYPO.note}>Aucune donnée n'est modifiée. Quand Repère calcule, il le dit, à côté du chiffre.</Text>
          {/* Deplace de l'accueil (16/10/2026) : l'accueil dit l'essentiel en une ligne,
              le detail technique reste vrai et trouvable ici. Phrase vraie a la lettre :
              les adresses se composent par departement (client.js), et la commune n'est
              gardee que sur demande (lib/memoire.ts). */}
          <View style={{ gap: PAS }}>
            <Text style={[TYPO.corps, { fontWeight: "800" }]} accessibilityRole="header">Ce que Repère sait de vous</Text>
            <Text style={TYPO.note}>Rien : pas de compte, pas d'e-mail.</Text>
            <Text style={TYPO.note}>L'application télécharge le fichier public de tout votre département, jamais celui de votre seule commune.</Text>
            <Text style={TYPO.note}>Elle ne garde votre commune sur ce téléphone que si vous le lui demandez.</Text>
          </View>
        </Page>
      );
    }} />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick(x: any): { producteur?: string; licence?: string; maj?: string; releve?: string; url?: string } {
  if (!x) return {};
  /* la licence n'etait pas reprise (08/10/2026, audit) : invariant 4 */
  return { producteur: x.producteur, licence: x.licence, maj: x.maj, releve: x.releve || x.releve_le, url: x.url };
}
