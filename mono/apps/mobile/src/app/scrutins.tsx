/* EXPLORER DES SCRUTINS — détail intégral à la demande.
 *
 * Niveau 1 : les scrutins (95 V1, solennels + motions de censure).
 * Niveau 2 : un scrutin sélectionné.
 * Niveau 3 : les groupes, puis les députés et leur position.
 *
 * Aucune couleur n'est utilisée pour dire « pour » ou « contre » : les trois
 * positions restent textuelles/neutres. Les groupes sont des catégories
 * descriptives issues de la source officielle.
 */
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { chargerScrutinsDetails, ETATS } from "../lib/donnees";
import { Page } from "../ui/page";
import { Vide } from "../lib/composants";
import { PastilleSource } from "../ui/source";
import { PAS, TYPO, couleurs, CIBLE, RAYON } from "../lib/theme";
import { dateFr, decompte, titreLisible } from "@repere/core";

type Position = { a: string; n: string | null; p: "p" | "c" | "a" };
type Groupe = { ref: string; nom: string; pour: number | null; contre: number | null; abstentions: number | null; positions: Position[] };
type Scrutin = { n: string; d: string; t: string; ty: string; s: string; dec: Record<string, string>; url: string; groupes: Groupe[] };
type Paquet = { source: { producteur_affiche: string; licence: string; url: string; releve_le: string }; scrutins: Scrutin[] };

const position = (p: string) => p === "p" ? "Pour" : p === "c" ? "Contre" : "Abstention";

export default function Scrutins() {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [paquet, setPaquet] = useState<Paquet | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());

  useEffect(() => {
    chargerScrutinsDetails().then(r => {
      setEtat(r.etat);
      setPaquet(r.donnees as Paquet | null);
      if (r.donnees?.scrutins?.length) {
        setSelection(r.donnees.scrutins[r.donnees.scrutins.length - 1].n);
      }
    });
  }, []);

  const sc = paquet?.scrutins.find(x => x.n === selection) || null;

  return (
    <Page>
      <Stack.Screen options={{ title: "Scrutins publics" }} />
      <Text style={TYPO.affiche}>Les votes de l'Assemblée</Text>
      <Text style={TYPO.note}>
        95 scrutins publics solennels et motions de censure de la XVIIe législature,
        avec les positions individuelles publiées par l'Assemblée.
      </Text>

      {!paquet ? (
        <Vide
          titre={etat === ETATS.EN_COURS ? "Chargement des scrutins." : "Les scrutins ne sont pas disponibles."}
          corps="Repère n'affiche pas une position quand le relevé détaillé n'est pas disponible."
        />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}>
            {paquet.scrutins.slice().reverse().map(x => (
              <Pressable
                key={x.n}
                onPress={() => { setSelection(x.n); setOuverts(new Set()); }}
                accessibilityRole="button"
                accessibilityLabel={`Scrutin n°${x.n}, ${dateFr(x.d)}`}
                style={{ minHeight: CIBLE, minWidth: 110, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: x.n === selection ? couleurs.voile : couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}
              >
                <Text style={TYPO.micro}>{dateFr(x.d)}</Text>
                <Text style={{ fontWeight: "700", color: couleurs.encre }}>n° {x.n}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {sc ? (
            <View style={{ gap: PAS * 3 }}>
              <Text style={TYPO.question}>{titreLisible(sc.t)}</Text>
              <Text style={TYPO.note}>{sc.s} · {dateFr(sc.d)} · scrutin n° {sc.n}</Text>
              <Text style={TYPO.corps}>{decompte(sc.dec)}</Text>

              {sc.groupes.map(g => {
                const ouvert = ouverts.has(g.ref);
                return (
                  <View key={g.ref} style={{ borderRadius: RAYON.bloc, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, overflow: "hidden" }}>
                    <Pressable
                      onPress={() => setOuverts(prev => {
                        const n = new Set(prev);
                        if (n.has(g.ref)) n.delete(g.ref); else n.add(g.ref);
                        return n;
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`${g.nom}, ${g.positions.length} positions publiées`}
                      style={{ minHeight: CIBLE, padding: PAS * 3, justifyContent: "center" }}
                    >
                      <Text style={{ fontWeight: "700", color: couleurs.encre }}>{g.nom}</Text>
                      <Text style={TYPO.note}>
                        {[g.pour != null ? `${g.pour} pour` : null, g.contre != null ? `${g.contre} contre` : null, g.abstentions != null ? `${g.abstentions} abstention${g.abstentions > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ")}
                      </Text>
                      <Text style={[TYPO.micro, { marginTop: PAS }]}>
                        {ouvert ? "Masquer les députés" : "Voir les députés"}
                      </Text>
                    </Pressable>

                    {ouvert ? (
                      <View style={{ borderTopWidth: 1, borderTopColor: couleurs.trait }}>
                        {g.positions.map((p, i) => (
                          <View key={p.a + i} style={{ minHeight: CIBLE, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                            <Text style={{ flex: 1, color: couleurs.encre }}>{p.n || p.a}</Text>
                            <Text style={{ fontWeight: "700", color: couleurs.sourd }}>{position(p.p)}</Text>
                          </View>
                        ))}
                        {!g.positions.length ? <Text style={[TYPO.note, { padding: PAS * 3 }]}>Aucune position individuelle publiée pour ce groupe sur ce scrutin.</Text> : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <PastilleSource court source={{
                producteur: paquet.source.producteur_affiche,
                licence: paquet.source.licence,
                url: sc.url,
                releve: paquet.source.releve_le,
                usage: "Repère reprend les positions individuelles publiées par l'Assemblée nationale pour ce scrutin. Les non-votants et les mises au point ne sont pas republies.",
              }} />
            </View>
          ) : null}
        </>
      )}
    </Page>
  );
}
