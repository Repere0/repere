/* ACTUALITÉS : les événements publiés par Repère (data/evenements.json), du plus récent
   au plus ancien. Chaque carte reprend un enregistrement tel quel et renvoie à sa source.
   Seuls les événements nationaux sont affichés ; ceux d'une commune ne le sont pas encore. */
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { dateFr, plusRecentEnPremier } from "@repere/core";
import { chargerEvenements, ETATS, PHRASES } from "../lib/donnees";
import { Carte, LienSortant, Vide } from "../lib/composants";
import { PAS, TYPO } from "../lib/theme";
import { DateDonnee } from "../ui/fraicheur";
import { Page, Question } from "../ui/page";
import { SquelettesListe } from "../ui/squelette";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { ActuStory } from "../ui/partage/variantes/actu.story";
import { BadgeZoom, useNiveauZoom } from "../ui/badge-zoom";
import { useProfil } from "../lib/profil";
import { visibleAuNiveau } from "@repere/core";
import { messageActu } from "../ui/partage/messages";
import { BoutonPartageTexte, ligneSource } from "../ui/partage/partager-texte";

type Evt = { id: string; t: string; d: string; axes?: string; e: string; src?: string; srcn?: string };

export default function Actus() {
  const niveauZoom = useNiveauZoom();
  const { modifier } = useProfil();
  /* V26 bloc 2 : les actualités sont nationales ; « Ma rue » ne les montre pas. */
  const nationalVisible = visibleAuNiveau(niveauZoom, "france");
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [liste, setListe] = useState<Evt[]>([]);
  const [maj, setMaj] = useState("");
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    chargerEvenements().then(r => {
      if (!vivant) return;
      const d = r.donnees as { maj?: string; r?: Evt[] } | null;
      if (d && Array.isArray(d.r)) {
        setListe(plusRecentEnPremier(d.r.filter(x => x.e === "france")));
        setMaj(d.maj || "");
        setEtat(ETATS.SERVI);
      } else {
        setEtat(r.etat);
      }
    });
    return () => { vivant = false; };
  }, [essai]);

  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string } | undefined;
  return (
    /* Audit 5 s (V15) : sansDate, la ligne DateDonnee de l'ecran dit deja la date et la source. */
    <Page sansDate>
      <BadgeZoom />
      <Stack.Screen options={{ title: "Actualités", headerRight: () => <BoutonPartageTexte titre="Actualités" chemin="actus" source="Source : sources officielles, indiquée sous chaque information." /> }} />
      <Question etiquette="Au Parlement" question="Actualités"
        sous="Ce qu'ont publié les sources officielles." />
      {/* Invariant 9, D14 : jamais « mis à jour » ; la date du fil et son anciennete. */}
      {etat === ETATS.SERVI && liste.length ? <DateDonnee quoi="Fil de la rédaction" date={maj} /> : null}
      {etat === ETATS.EN_COURS ? <SquelettesListe n={3} hauteur={120} /> : null}
      {etat !== ETATS.SERVI && etat !== ETATS.EN_COURS && phrase ? (
        <Vide titre={phrase.titre} corps={phrase.corps} action="Réessayer" onAction={() => setEssai(n => n + 1)} />
      ) : null}
      {etat === ETATS.SERVI && !liste.length ? (
        <Vide titre="Pas encore d'actualité nationale dans nos données."
          corps="Repère n'a pas relevé d'événement national dans ses données. Le calendrier montre les séances annoncées."
          action="Voir le calendrier" onAction={() => router.push("/a-venir")} />
      ) : null}
      {!nationalVisible ? (
        <Vide titre="Ces actualités sont nationales." corps="Votre vue est « Ma rue » : elles ne s'affichent pas à ce niveau. Passez à « La France » ou « Tout » pour les voir."
          action="Voir la vue La France" onAction={() => modifier({ niveauZoom: "france" })} />
      ) : null}
      {nationalVisible ? liste.map(x => <ActuCarte key={x.id} x={x} />) : null}
    </Page>
  );
}

function ActuCarte({ x }: { x: Evt }) {
  /* Les sauts de ligne du fichier coupent des phrases : le texte est un seul paragraphe. */
  const texte = (x.axes || "").replace(/\s*\n\s*/g, " ").trim();
  const source = x.srcn ? `Source : ${x.srcn}.` : "";
  return (
    <Carte>
      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.note}>{dateFr(x.d)}</Text>
        <Text style={[TYPO.corps, { fontWeight: "700" }]} accessibilityRole="header">{x.t}</Text>
        {texte ? <Text style={TYPO.corps}>{texte}</Text> : null}
        {x.src ? <LienSortant url={x.src} texte={x.srcn || "Source officielle"} /> : null}
        {x.src ? (
          <PartagerCarte etiquette={`Partager : ${x.t}`}
            repli={messageActu({ titre: x.t, source: x.srcn || "", lien: x.src })}
            rendu={ref => <ActuStory refCarte={ref} titre={x.t} corps={texte} source={source} />} />
        ) : null}
      </View>
    </Carte>
  );
}
