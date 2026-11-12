/* LE QUIZ CIVIQUE (12/11/2026, décision du porteur) : un écran à lui, séparé du dictionnaire. Quatre définitions, une seule
 * juste ; vocabulaire institutionnel seulement. La série vit en mémoire (invariant 2 : aucune clé de stockage en plus),
 * aucun score comparé, aucun partage, aucun son (invariant 6). */
import { Stack } from "expo-router";
import { Page, Question } from "../ui/page";
import { Quiz } from "../ui/quiz";
import { categorieDuMot } from "../lib/categories-mots";

export default function QuizEcran() {
  return (
    <Page sansDate>
      <Stack.Screen options={{ title: "Quiz civique" }} />
      <Question etiquette="Culture civique" question="Testez votre culture civique"
        sous="Quatre définitions, une seule juste. Du vocabulaire institutionnel, jamais une opinion." />
      <Quiz categorieDe={categorieDuMot} />
    </Page>
  );
}
