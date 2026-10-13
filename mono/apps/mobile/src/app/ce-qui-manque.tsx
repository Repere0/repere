/* « CE QUE REPÈRE NE MONTRE PAS ENCORE » (beta, 13/10/2026).
 *
 * Les absences de l'application, dites une fois, avec leur raison : un testeur
 * sait ce qu'il ne doit pas chercher, et une absence n'est jamais comblée par
 * une supposition (doctrine du vide, invariant 5). Le texte vit dans
 * lib/absences.ts ; cet écran ne fait que le montrer. */
import { Text } from "react-native";
import { Stack } from "expo-router";
import { Carte } from "../lib/composants";
import { MANQUE_ENCORE } from "../lib/absences";
import { TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";

export default function CeQuiManque() {
  return (
    <Page>
      <Stack.Screen options={{ title: "Ce qui manque" }} />
      <Question etiquette="Bêta" question="Ce que Repère ne montre pas encore"
        sous="Chaque absence est dite avec sa raison. Repère ne la remplit pas par une supposition." />
      {MANQUE_ENCORE.map(m => (
        <Carte key={m.titre} titre={m.titre}>
          <Text style={TYPO.corps}>{m.raison}</Text>
        </Carte>
      ))}
      <Text style={TYPO.note}>Liste établie le 13 octobre 2026. Elle change quand une donnée arrive ; le site officiel fait foi.</Text>
    </Page>
  );
}
