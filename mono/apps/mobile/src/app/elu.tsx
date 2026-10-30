/* « FICHE D'UN ÉLU » — le canevas Fiche, en donnees reelles (13/10/2026).
 * Refonte du 30/10/2026 (sprint v10, bloc C) : la synthese d'abord.
 *
 * Ouvert par le nom de la personne, depuis la chaine « Qui décide ». Chaque nom
 * de la chaine ouvre cette fiche : c'est la regle du porteur (13/10/2026).
 *
 * L'ORDRE DE LA FICHE : identite et groupe ; pour un depute, ses trois votes
 * publies les plus recents, chacun avec « Comprendre ce vote » ; le lien vers tous
 * ses votes publies ; sa fonction et ce que ce niveau decide ; son parcours ; les
 * sources ; en pied, la mention du parti et un partage discret.
 *
 * CE QUI EST AFFICHE, ET CE QUI NE L'EST PAS.
 *   - Le nom, le role et l'institution : ce que la source du niveau donne.
 *   - Le parti : « non publié par la source » tant que la source ne le donne pas,
 *     en petit, en pied de fiche. Repère ne le devine jamais.
 *   - Les votes : ceux de cet elu (filtre sur son nom), parmi les scrutins publies.
 *     Positions dites en mots, avec un signe de la couleur du sens du vote (D24,
 *     ADR 0003 : vert pour, rouge contre, gris abstention ; un fait, pas un jugement).
 *   - « Comprendre ce vote » : le resultat publie, et le resume de la redaction
 *     Repere s'il existe (evenements.json, chaque resume porte sa source
 *     officielle). Sinon, le titre seul et le lien vers le scrutin officiel.
 *   - « Ce qu'il défend » : absent. Les scrutins publies ne portent ni theme ni
 *     dossier : rien a compter sans inventer (BLOCAGES.md, section 15).
 *   - Patrimoine, presence ou absence aux seances : jamais (invariant 8). */
import { BadgeGroupe } from "../ui/badge-groupe";
import { GROUPE_INCONNU, groupeDe } from "../lib/groupes";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { VoteStory } from "../ui/partage/variantes/vote.story";
import { messageVote, VERBE } from "../ui/partage/messages";
import { useEffect, useState } from "react";
import { Animated, Linking, Modal, Pressable, ScrollView, Share, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { chaineDecision, copieVoteVide, dateFr, debutDeMandat, decompte, ETAT_VOTE, LIBELLES, lienScrutin, repartitionVote, titreLisible } from "@repere/core";
import { Repartition } from "../ui/visuels";
import { Carte, Vide } from "../lib/composants";
import { chargerEvenements } from "../lib/donnees";
import { srcElus, srcScrutins } from "../lib/sources";
import { couleurs, CIBLE, COULEUR_VOTE, PAS, RAYON, TYPO, type Echelon } from "../lib/theme";
import { AvecPicto } from "../ui/picto";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { DateDonnee } from "../ui/fraicheur";
import { useApparition } from "../ui/mouvement";
import { Avatar, CreditPhoto } from "../ui/avatar";
import { usePhotoElu } from "../lib/photos";
import { useSelection } from "../lib/selection";

type Params = { nom?: string; role?: string; echelon?: string; niveau?: string; institution?: string; lieu?: string };
type Scrutin = { n: string; t: string; d: string; sl?: string; dec?: unknown };
type FaitElu = { type: string; position?: string; qui: string; sc: Scrutin };
type Resume = { id: string; axes?: string; src?: string; srcn?: string };

const PARTI_NON_PUBLIE = "Parti : non publié par la source. Repère ne le déduit pas.";
const POSITION: Record<string, string> = { p: "Pour", c: "Contre", a: "Abstention" };
/* Signes de texte (variante texte forcee, pas d'emoji), colores selon le sens du vote (D24). */
const SIGNE: Record<string, string> = { p: "✓︎", c: "✕︎", a: "○︎" };
const SYNTHESE = 3;

function Initiales({ nom }: { nom: string }) {
  const lettres = nom.split(/\s+/).filter(Boolean).map(m => m[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View accessible={false}
      style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: couleurs.encre, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 26 }}>{lettres}</Text>
    </View>
  );
}

function Lien({ texte, onPress, etiquette }: { texte: string; onPress: () => void; etiquette?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette ?? texte}
      style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ color: couleurs.lien, fontWeight: "700", fontSize: 15 }}>{texte}</Text>
    </Pressable>
  );
}

function CarteVote({ f, onComprendre }: { f: FaitElu; onComprendre: () => void }) {
  const pos = f.position as string;
  const rep = repartitionVote(f.sc);
  const qui = f.qui;
  return (
    <View style={{ gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}
      accessibilityLabel={`${dateFr(f.sc.d)} : ${POSITION[pos]} sur ${titreLisible(f.sc.t)}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
        <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: 18, fontWeight: "800", color: COULEUR_VOTE[pos as keyof typeof COULEUR_VOTE] ?? couleurs.encre, width: 20 }}>{SIGNE[pos]}</Text>
        <Text style={[TYPO.corps, { fontWeight: "800" }]}>{POSITION[pos]}</Text>
        <Text style={[TYPO.micro, { marginLeft: "auto" }]}>{dateFr(f.sc.d)}</Text>
      </View>
      <Text style={TYPO.corps} numberOfLines={3}>{titreLisible(f.sc.t)}</Text>
      {/* V13 bloc C : la micro-jauge du scrutin entier, et son decompte en toutes lettres. */}
      {rep ? (
        <View style={{ gap: PAS }}>
          <Repartition compact segments={rep.segments} total={rep.total} position={pos} qui={qui} />
          <Text style={TYPO.micro}>L'Assemblée : {decompte(f.sc.dec)}.</Text>
        </View>
      ) : null}
      <Lien texte="Comprendre ce vote" etiquette={`Comprendre ce vote : ${titreLisible(f.sc.t)}`} onPress={onComprendre} />
    </View>
  );
}

function FeuilleVote({ f, nom, resume, base, onFermer }: { f: FaitElu | null; nom: string; resume: Resume | null; base: string | null; onFermer: () => void }) {
  const lien = f && base ? lienScrutin(base, f.sc) : null;
  return (
    <Modal visible={!!f} animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      {f ? (
        <ScrollView style={{ backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 5, gap: PAS * 3, maxWidth: 640, width: "100%", alignSelf: "center" }}>
          <Text style={TYPO.question} accessibilityRole="header">Comprendre ce vote</Text>
          <Text style={TYPO.micro}>Scrutin n° {f.sc.n}, {dateFr(f.sc.d)}</Text>
          <Text style={[TYPO.corps, { fontWeight: "700" }]}>{titreLisible(f.sc.t)}</Text>
          <Text style={TYPO.corps}>{nom} : {POSITION[f.position as string].toLowerCase()}.</Text>
          {/* D24 : la repartition du scrutin, en couleurs de vote, avec sa legende chiffree. */}
          {/* Sur une carte, jamais sur le sol : le vert y fait 3,22:1 au lieu de 2,88:1 (ADR 0003). */}
          {repartitionVote(f.sc) ? (
            <View style={{ padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte }}>
              <Repartition segments={repartitionVote(f.sc)!.segments} total={repartitionVote(f.sc)!.total} position={f.position} qui={nom} />
            </View>
          ) : null}
          {f.sc.sl ? <Text style={TYPO.corps}>{f.sc.sl.charAt(0).toUpperCase() + f.sc.sl.slice(1)}{f.sc.dec ? `, ${decompte(f.sc.dec)}` : ""}.</Text> : null}
          {resume && resume.axes ? (
            <View style={{ gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte }}>
              <Text style={[TYPO.corps, { fontWeight: "700" }]} accessibilityRole="header">Ce que change ce texte</Text>
              <Text style={TYPO.corps}>{resume.axes.replace(/\s*\n\s*/g, " ")}</Text>
              <Text style={TYPO.note}>Résumé de la rédaction Repère{resume.srcn ? `, d'après : ${resume.srcn}` : ""}.</Text>
              {resume.src ? <Lien texte="Lire la source officielle" etiquette="Lire la source officielle, ouvre un site externe" onPress={() => Linking.openURL(resume.src as string)} /> : null}
            </View>
          ) : (
            <Text style={TYPO.note}>Repère n'a pas encore de résumé de ce texte. Le scrutin officiel donne le texte complet et le détail des votes.</Text>
          )}
          {lien ? <Lien texte="Voir le scrutin sur le site de l'Assemblée" etiquette={`${lien.texte}, ouvre un site externe`} onPress={() => Linking.openURL(lien.url)} /> : null}
          <Pressable onPress={onFermer} accessibilityRole="button"
            style={({ pressed }) => ({ minHeight: CIBLE, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: couleurs.trait, marginTop: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
            <Text style={[TYPO.corps, { fontWeight: "700" }]}>Fermer</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </Modal>
  );
}

/* La photo libre si elle existe (D27), sinon les initiales ; et son credit, dessous. */
function PhotoOuInitiales({ nom, dep, cle }: { nom: string; dep: string; cle: string | null }) {
  const photo = usePhotoElu(dep, cle);
  return photo ? <Avatar nom={nom} taille={72} photo={photo} /> : <Initiales nom={nom} />;
}
function CreditDe({ dep, cle }: { dep: string; cle: string | null }) {
  const photo = usePhotoElu(dep, cle);
  return photo ? <CreditPhoto photo={photo} /> : null;
}

export default function Elu() {
  const p = useLocalSearchParams<Params>();
  const nom = p.nom || "Élu";
  const echelon = p.echelon || "";
  const apparition = useApparition(0);
  const [ouvert, setOuvert] = useState<FaitElu | null>(null);
  const { choix } = useSelection();
  const [resumes, setResumes] = useState<Resume[]>([]);
  /* Les resumes de la redaction : un fichier public ; s'il n'arrive pas, la feuille dit qu'il n'y a pas de resume. */
  useEffect(() => {
    let vivant = true;
    chargerEvenements().then(r => { if (vivant && r.donnees) setResumes(((r.donnees as { r?: Resume[] }).r) || []); }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  return (
    <AvecDonnees rendu={r => {
      const niveaux = chaineDecision({ fiche: r.d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: r.d.dep });
      const niveau = (niveaux as { echelon: string; decide?: string; personne?: { debut?: string | null } | null }[]).find(n => n.echelon === echelon);
      const decide = niveau?.decide;
      /* Date de debut du mandat : montree seulement avec la date de relevé de sa source (core). */
      const debutMandat = debutDeMandat(niveau, r.deputes && r.deputes.source);
      const depute = echelon === "france";
      /* LES VOTES DE CET ÉLU, PAS CEUX DE LA COMMUNE : filtrés sur son nom, du plus récent au plus ancien. */
      const votes = depute
        ? (r.d.faits as FaitElu[]).filter(f => f.type === "vote" && !!f.position && !!POSITION[f.position as string] && f.qui === nom)
          .sort((a, b) => (a.sc.d < b.sc.d ? 1 : a.sc.d > b.sc.d ? -1 : 0))
        : [];
      const vote = votes[0];
      const etatVote = !depute || vote ? null
        : !r.votesLus ? ETAT_VOTE.RELEVE_NON_LU
        : !r.votesFiables ? ETAT_VOTE.RELEVE_INCOHERENT
        : (r.d as unknown as { etatVotePour: (n: string) => string | null }).etatVotePour(nom);
      const videVote = etatVote ? copieVoteVide(etatVote, { nom, elu: true, releve: srcScrutins(r.d)?.releve, portee: r.d.srcScrutins && r.d.srcScrutins.portee }) : null;
      const libelleRole = [p.role, p.lieu].filter(Boolean).join(" · ");
      const groupe = groupeDe();
      /* La cle de la photo (D27) : l'identifiant de l'Assemblee pour un depute (nom complet
         identique dans deputes.json), « M » + INSEE pour le maire de la commune choisie. */
      const deps = ((r.deputes && r.deputes.deputes) || {}) as Record<string, { prenom?: string; nom?: string; acteurRef?: string }>;
      const refDepute = depute ? Object.values(deps).find(x => [x.prenom, x.nom].filter(Boolean).join(" ") === nom)?.acteurRef : undefined;
      const estMaire = echelon === "ville" && !!r.d.fiche && !!r.d.fiche.maire && r.d.fiche.maire.nom === nom;
      const clePhoto = refDepute || (estMaire && choix ? "M" + choix.insee : null);
      const resume = ouvert ? resumes.find(x => x.id === `scrutin-${ouvert.sc.d}-${ouvert.sc.n}`) || null : null;
      /* Carte de partage : seulement le dernier vote publie de cet elu, avec sa source. Sans
         vote ou sans source publiee, pas de carte : le partage reste textuel. */
      const carteVote = vote && vote.position && r.d.srcScrutins ? {
        phrase: `${nom} ${VERBE[vote.position]}`,
        titre: titreLisible(vote.sc.t),
        sous: `Vote à l'Assemblée nationale, ${dateFr(vote.sc.d)}.`,
        source: `Source : ${r.d.srcScrutins.producteur}, scrutin n° ${vote.sc.n}, ${dateFr(vote.sc.d)}.`,
        repli: messageVote({
          phrase: `${nom} ${VERBE[vote.position]}`, titre: titreLisible(vote.sc.t), date: dateFr(vote.sc.d),
          lien: r.d.base ? lienScrutin(r.d.base, vote.sc).url : null,
        }),
      } : null;
      const partager = () => Share.share({
        message: `${nom}${libelleRole ? `, ${libelleRole}` : ""}.${p.institution ? ` ${p.institution}.` : ""}\nRésumé Repère, à partir des données publiées. Le détail est dans l'application.`,
      });

      return (
        /* Audit 5 s (V15) : sansDate, la ligne DateDonnee de l'ecran dit deja la date et la source. */
        <Page sansDate>
          <Stack.Screen options={{ title: "Fiche" }} />
          <Animated.View style={{ opacity: apparition, gap: PAS * 4 }}>
            {/* Identite */}
            <View style={{ flexDirection: "row", gap: PAS * 4, alignItems: "center" }}>
              <PhotoOuInitiales nom={nom} dep={r.d.dep} cle={clePhoto} />
              <View style={{ flex: 1, gap: 8 }}>
                {/* Audit 5 s (V19) : pas d'etiquette quand le role la dit deja (« Assemblée nationale »
                    au-dessus de « À l'Assemblée nationale pour votre circonscription »). */}
                <Question etiquette={libelleRole && (p.niveau || "") && libelleRole.toLowerCase().includes((p.niveau || "").toLowerCase()) ? undefined : (p.niveau || LIBELLES.qui)}
                  question={nom} sous={libelleRole || undefined} />
              </View>
            </View>
            <CreditDe dep={r.d.dep} cle={clePhoto} />
            {/* Groupe : identifie l'élu. Gris « Inconnu » tant que le lien n'est pas publié. */}
            {depute ? <BadgeGroupe groupe={groupe} /> : null}
            {/* V13 bloc A : la date de ce qu'affiche la fiche (les votes pour un depute,
               le repertoire des elus sinon), avec la source. */}
            {depute
              ? <DateDonnee quoi="Relevé des votes" date={r.index?.sources?.scrutins?.releve_le} url={r.index?.sources?.scrutins?.url} />
              : <DateDonnee quoi="Répertoire des élus" date={r.index?.sources?.elus?.maj} url={r.index?.sources?.elus?.url} />}

            {/* LA SYNTHESE : ses trois votes publies les plus recents. */}
            {depute ? (
              <View style={{ gap: PAS * 3 }}>
                <AvecPicto picto="vote"><Text style={TYPO.etiquette} accessibilityRole="header">Ses derniers votes</Text></AvecPicto>
                {votes.length ? votes.slice(0, SYNTHESE).map(f => (
                  <CarteVote key={f.sc.n} f={f} onComprendre={() => setOuvert(f)} />
                )) : videVote ? <Vide {...videVote} /> : null}
                {votes.length > SYNTHESE ? (
                  <Lien texte={`Voir ses ${votes.length} votes publiés`} etiquette={`Voir les ${votes.length} votes publiés de ${nom}`} onPress={() => router.push("/vote")} />
                ) : null}
                {votes.length ? (
                  <Text style={TYPO.micro}>Parmi les scrutins solennels publiés par l'Assemblée nationale et relevés par Repère.</Text>
                ) : null}
              </View>
            ) : (
              <Text style={TYPO.note}>Cette fonction ne vote pas au Parlement. Repère n'affiche donc aucun vote pour elle.</Text>
            )}

            <Carte echelon={echelon as Echelon} titre="Fonction">
              {p.institution ? <Text style={TYPO.corps}>{p.institution}</Text> : null}
              {p.lieu ? <Text style={TYPO.note}>{p.lieu}</Text> : null}
              {debutMandat.etat === "date" ? (
                <Text style={TYPO.note}>En fonction depuis le {dateFr(debutMandat.date)}. Source : {debutMandat.producteur}, données relevées le {dateFr(debutMandat.releve_le)}.</Text>
              ) : debutMandat.etat === "sans_releve" ? (
                <Text style={TYPO.note}>Date de début de la fonction : non affichée, la source ne dit pas quand ses données ont été relevées.</Text>
              ) : debutMandat.etat === "non_publie" ? (
                <Text style={TYPO.note}>Date de début de la fonction : non publiée par la source. Repère ne la devine pas.</Text>
              ) : null}
            </Carte>
            {decide ? (
              <Carte titre="Ce que ce niveau décide">
                <Text style={TYPO.corps}>{decide}.</Text>
                <Text style={TYPO.note}>Les mêmes phrases que sur « Qui décide ».</Text>
              </Carte>
            ) : null}

            <Carte titre="D'où viennent ces informations">
              <PastilleSource source={srcElus(r.srcElus ?? null)} />
            </Carte>

            {/* PIED : le parti en petit, un partage discret. */}
            <View style={{ gap: PAS * 2, borderTopWidth: 1, borderTopColor: couleurs.trait, paddingTop: PAS * 3 }}>
              {!depute || groupe === GROUPE_INCONNU ? <Text style={TYPO.micro}>{PARTI_NON_PUBLIE}</Text> : null}
              <Text style={TYPO.micro}>Repère n'affiche que les faits de mandat publiés. Le patrimoine des élus, et leur présence ou absence aux séances, ne figurent jamais.</Text>
              {carteVote ? (
                <PartagerCarte etiquette={`Partager le dernier vote de ${nom}`} repli={carteVote.repli}
                  rendu={ref => <VoteStory refCarte={ref} groupe={groupe} etiquette="Dernier vote" phrase={carteVote.phrase}
                    titre={carteVote.titre} sous={carteVote.sous} source={carteVote.source} />} />
              ) : (
                <Lien texte="Partager la fiche" onPress={partager} />
              )}
            </View>
          </Animated.View>
          <FeuilleVote f={ouvert} nom={nom} resume={resume} base={r.d.base || null} onFermer={() => setOuvert(null)} />
        </Page>
      );
    }} />
  );
}
