/* LE GUIDE DE VOTE — ancien écran « Ma voix », devenu une section de la page Présidentielle 2027
 * (11/11/2026, fusion des trois écrans d'élection). L'agenda des élections nationales et le guide civique (V30, bloc 2 ; « Ma voix » et
 * accordéons depuis le 05/11/2026). Accordéons natifs (Pressable + état), sans dépendance.
 *
 * Les dates viennent de lib/elections.ts, vérifiées sur service-public.gouv.fr le 30/10/2026.
 * Les élections déjà passées (municipales de mars 2026, sénatoriales de 2026) ne sont pas listées.
 * Le guide ne donne que des règles générales et renvoie au site officiel pour les délais et démarches. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { dateFr } from "@repere/core";
import { Carte, LienSortant } from "../lib/composants";
import { Timeline } from "./timeline";
import { DEMARCHES, DEMARCHES_VERIFIEES_LE, ELECTIONS, ELECTIONS_SOURCE, ELECTIONS_VERIFIEES_LE } from "../lib/elections";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";

const JOUR = 86400000;

/* Jours entre aujourd'hui et la date (0 = aujourd'hui). Les deux dates sont comptées en UTC, à minuit. */
function joursAvant(iso: string): number {
  const [a, m, j] = iso.split("-").map(Number);
  const now = new Date();
  return Math.round((Date.UTC(a, m - 1, j) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / JOUR);
}

/* Chaque réponse générale porte sa source. Conseil municipal : séances publiques (CGCT L. 2121-18,
 * Légifrance, en vigueur au 05/11/2026 ; la fiche de la préfecture de l'Aude répond 404 depuis) ; procès-verbal publié en ligne dans la semaine et
 * liste des délibérations affichée et mise en ligne (CGCT L. 2121-15 et L. 2121-25, rappel de la
 * préfecture de Haute-Corse, août 2022). Lues le 05/11/2026. */
const SOURCE_L2121_18 = "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006389876";
const SOURCE_HAUTE_CORSE = "https://www.haute-corse.gouv.fr/contenu/telechargement/6633/54809/file/2022-08_reforme_pub_des_actes_rappel.pdf";

type Entree = { titre: string; texte: string; source?: { texte: string; url: string } };
const GUIDE: Entree[] = [
  { titre: "Comment s'inscrire ?", texte: "Vous devez être inscrit sur les listes électorales de votre commune. L'inscription se fait en mairie ou en ligne, avant la date limite fixée par la loi : vérifiez-la sur service-public.fr." },
  { titre: "Comment voter ?", texte: "Présentez-vous au bureau de vote indiqué sur votre carte électorale, avec une pièce d'identité en cours de validité." },
  { titre: "Faire une procuration", texte: "Si vous ne pouvez pas vous déplacer, vous pouvez donner procuration à une personne inscrite sur les listes électorales, qui votera à votre place. La démarche est détaillée sur service-public.fr." },
  { titre: "Trouver mon bureau de vote", texte: "Votre bureau de vote figure sur votre carte électorale. Le service officiel « Vérifier mon inscription et mon bureau de vote », plus bas, l'indique aussi." },
  { titre: "Comment assister au conseil municipal ?", texte: "Les séances du conseil municipal sont publiques (article L. 2121-18 du code général des collectivités territoriales) : chacun peut y assister. À la demande de trois conseillers ou du maire, le conseil peut décider par un vote de se réunir à huis clos. Les séances peuvent être retransmises. Pour connaître la date des prochaines séances, renseignez-vous auprès de votre mairie.",
    source: { texte: "Article L. 2121-18, sur Légifrance", url: SOURCE_L2121_18 } },
  { titre: "Où trouver ce qu'a décidé le conseil ?", texte: "Depuis le 1er juillet 2022, la liste des délibérations est affichée en mairie et mise en ligne sur le site de la commune, s'il existe, dans la semaine. Le procès-verbal de chaque séance est publié sur ce site dans la semaine qui suit son adoption ; un exemplaire papier reste consultable en mairie (articles L. 2121-25 et L. 2121-15).",
    source: { texte: "Rappel de la préfecture de Haute-Corse", url: SOURCE_HAUTE_CORSE } },
];

/* Un accordéon : la question est un bouton, la réponse s'ouvre dessous. */
function Accordeon({ e, premier }: { e: Entree; premier?: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <View style={{ borderTopWidth: premier ? 0 : 1, borderColor: couleurs.voile }}>
      <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={e.titre} accessibilityHint={ouvert ? "Replier la réponse" : "Déplier la réponse"}
        style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, paddingVertical: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.corps, { flex: 1, fontWeight: "700", color: couleurs.encre }]}>{e.titre}</Text>
        <Ionicons name={ouvert ? "chevron-up" : "chevron-down"} size={20} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
      </Pressable>
      {ouvert ? (
        <View style={{ gap: PAS, paddingBottom: PAS * 3 }}>
          <Text style={[TYPO.corps, { color: couleurs.encre }]}>{e.texte}</Text>
          {e.source ? <LienSortant url={e.source.url} texte={e.source.texte} /> : null}
        </View>
      ) : null}
    </View>
  );
}

export function GuideVote() {
  const datees = ELECTIONS.filter(e => e.date).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  return (
    <View style={{ gap: PAS * 4 }}>
      <Carte>{GUIDE.map((g, k) => <Accordeon key={g.titre} e={g} premier={k === 0} />)}</Carte>
      <Carte titre="Faire la démarche en ligne">
        {DEMARCHES.map(d => <LienSortant key={d.url} url={d.url} texte={d.texte} />)}
        <Text style={TYPO.note}>
          Services officiels de l'État, sur service-public.fr. Repère n'envoie rien : vous saisissez vos informations sur le site officiel. Liens vérifiés le {dateFr(DEMARCHES_VERIFIEES_LE)}.
        </Text>
      </Carte>
      <Carte titre="Les élections à venir">
        <Timeline etapes={datees.filter(e => joursAvant(e.date as string) >= 0).map(e => ({ date: e.date as string, libelle: e.titre, lien: null }))} />
        {ELECTIONS.filter(e => !e.date).map(e => (
          <Text key={e.type} style={TYPO.note}>{e.titre} : date non fixée.</Text>
        ))}
        <LienSortant url={ELECTIONS_SOURCE.url} texte="Le détail des démarches, sur service-public.fr" />
        <Text style={TYPO.note}>
          Source des dates : {ELECTIONS_SOURCE.producteur}, vérifié le {dateFr(ELECTIONS_VERIFIEES_LE)}. Les dates peuvent changer par décret : vérifiez avant de vous déplacer.
        </Text>
      </Carte>
    </View>
  );
}
