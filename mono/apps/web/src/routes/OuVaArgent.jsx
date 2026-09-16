import React, { useMemo } from "react";
import { Carte, Vide, Tuile, BarreEchelon, Source, Mot } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";

/* Le tableau plat des comptes : [population, montant0, parHab0, montant1, ...].
   Six agrégats, deux valeurs chacun. La forme vient du fichier officiel ; on ne
   la devine pas, meta.agregats la porte. */
/* UN ZERO PUBLIE N'EST PAS UNE ABSENCE, ET LES CONFONDRE FAISAIT DIRE AU PRODUIT
   LE CONTRAIRE DE LA VERITE.
 *
 * CE QUI ETAIT ECRIT : `typeof m === "number" && m !== 0 ? m : null`. Un montant de
 * zero publie par l'Observatoire devenait donc `null`, et l'ecran affichait
 * « Non renseigne pour l'exercice 2025. Le fichier ne porte pas cette ligne — ce
 * n'est pas un montant nul. » Soit exactement l'inverse de ce que la source dit.
 *
 * MESURE DU 15/09/2026 : Mulcent (78439) devait 200 000 EUR en 2021 et ne doit PLUS
 * RIEN en 2024 et 2025. La commune a rembourse sa dette — le fait qu'un habitant
 * serait le plus heureux d'apprendre — et le produit repondait qu'il ne savait pas. 71 communes franciliennes etaient dans ce cas sur la dette, 5 sur les
 * salaires, 2 sur l'investissement.
 *
 * L'invariant 5 exige que deux causes d'absence differentes produisent deux phrases
 * differentes. Ici une seule phrase couvrait deux realites opposees, et enoncait la
 * fausse. `valeur()` distingue donc desormais TROIS etats : un montant, un zero
 * publie, une absence. */
function valeur(ex, i) {
  if (!Array.isArray(ex)) return null;
  const m = ex[1 + i * 2], h = ex[2 + i * 2];
  const mm = typeof m === "number" ? m : null;
  const hh = typeof h === "number" ? h : null;
  return mm === null && hh === null ? null : { m: mm, hab: hh, zero: mm === 0 };
}
const population = ex => (Array.isArray(ex) && ex[0] > 0 ? ex[0] : null);
const pourCent = (a, b) => Math.round((a / b) * 100);

/* TRADUIRE, pas afficher. Chaque phrase porte ce qu'elle NE veut PAS dire :
   c'est la moitié du travail, et celle qui manque partout ailleurs. Aucun de ces
   rapports ne sort du territoire affiché — invariant 3. */
function rapports(ex) {
  const v = i => valeur(ex, i);
  const [rec, dep, det, inv, sal, imp] = [0, 1, 2, 3, 4, 5].map(v);
  const nn = x => x && typeof x.m === "number" && x.m > 0;
  const out = [];
  if (nn(det) && nn(rec)) out.push({
    l: <>Son <Mot cle="encours de dette">encours de dette</Mot></>,
    v: (det.m / (rec.m / 12)).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " mois de recettes",
    d: "Si tout ce qui est encaissé allait au remboursement, il faudrait ce temps-là. Ce n'est pas ce qui se passe : une dette se rembourse sur des années, et un emprunt sert le plus souvent à payer un équipement qui durera plus longtemps que lui.",
  });
  if (nn(sal) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(sal.m, dep.m) + " € de salaires",
    d: "Ce sont les agents qui tiennent l'école, la cantine, l'état civil, les espaces verts. Une part élevée n'est pas un gaspillage : c'est souvent le signe d'une collectivité qui rend ses services elle-même plutôt que de les acheter à l'extérieur.",
  });
  if (nn(inv) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(inv.m, dep.m) + " € d'investissement",
    d: "Les travaux et les équipements : une école, une voirie, une salle. Cette part bouge beaucoup d'une année à l'autre — haute l'année d'un chantier, basse ensuite. Une seule année ne dit rien d'une tendance.",
  });
  if (nn(imp) && nn(rec)) {
    const p = pourCent(imp.m, rec.m);
    out.push({
      l: "Sur 100 € encaissés", v: p + " € d'impôts et taxes",
      d: `Les ${100 - p} € restants viennent d'ailleurs : dotations versées par l'État, subventions d'autres collectivités, sommes payées par les usagers de certains services. Repère ne détaille pas cette composition — le fichier ne la porte pas.`,
    });
  }
  if (nn(dep)) out.push({
    l: "Ses dépenses", v: Math.round(dep.m / 365).toLocaleString("fr-FR") + " € par jour",
    d: "Moyenne sur l'année, pas un rythme réel : les dépenses d'une collectivité sont très irrégulières. C'est une façon de rendre un total annuel imaginable, rien de plus.",
  });
  return out;
}

export default function OuVaArgent({ paquet, index, commune }) {
  const agregats = (index && index.agregats) || [];
  const src = index && index.sources ? index.sources.comptes : null;

  const c = commune ? paquet.communes[commune] : null;
  const exercice = useMemo(() => {
    if (!c || !c.comptes) return null;
    const ans = Object.keys(c.comptes).filter(a => /^\d{4}$/.test(a)).sort();
    for (let i = ans.length - 1; i >= 0; i--) {
      if (agregats.some((_, j) => valeur(c.comptes[ans[i]], j))) return { an: ans[i], ex: c.comptes[ans[i]] };
    }
    return null;
  }, [c, agregats]);

  if (!c) return null;

  const rr = exercice ? rapports(exercice.ex) : [];
  const maxAgregat = exercice
    ? Math.max(...agregats.map((_, i) => (valeur(exercice.ex, i) || {}).m || 0))
    : 0;

  if (!exercice) {
    /* DOCTRINE DU VIDE. Avant, les communes sans comptes disparaissaient
       simplement de la liste : le lecteur cherchait la sienne, ne la trouvait
       pas, et rien ne lui disait pourquoi. Une absence se dit. */
    return (
      <Vide titre={`${c.nom} : ses comptes ne figurent pas dans le fichier officiel.`}
        corps="Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux. Les très petites communes et celles qui viennent de fusionner manquent souvent à ce fichier."
        lien={{ texte: "Chercher cette commune dans les comptes publics", url: "https://data.ofgl.fr/" }} />
    );
  }

  return (
    <Pile>
      {/* Nom seul : « les comptes de X » demanderait une elision non derivable. */}
      <Carte echelon="ville" titre={c.nom}
        sousTitre={<>Les comptes de la commune · <Mot cle="exercice">exercice</Mot> {exercice.an}{population(exercice.ex) ? ` · ${population(exercice.ex).toLocaleString("fr-FR")} habitants` : ""} · budget principal</>}
        tag="Donnée officielle">
        <p className="tx-note tx-intro">
          Les six lignes ci-dessous sont publiées telles quelles par l'Observatoire des finances
          locales. Elles sont en euros, pour cette commune seule, sur une seule année.
        </p>
        {agregats.map((a, i) => {
          const v = valeur(exercice.ex, i);
          /* TROIS ETATS, TROIS PHRASES — voir le commentaire de valeur().
             L'absence dit qu'on ne sait pas ; le zero dit qu'il n'y a rien. Ce ne
             sont pas les memes nouvelles, et pour la dette la seconde est bonne. */
          if (!v) return (
            <div className="ligne" key={i}>
              <div className="ligne-h"><span>{a[1]}</span><b>—</b></div>
              <div className="ligne-note">Non renseigné pour l'exercice {exercice.an}. Le fichier ne porte pas cette ligne — ce n'est pas un montant nul.</div>
            </div>
          );
          if (v.zero) return (
            <div className="ligne" key={i}>
              <div className="ligne-h"><span>{a[1]}</span><b>0 €</b></div>
              <div className="ligne-note">
                {i === 2
                  ? `L'Observatoire publie un encours de dette nul pour l'exercice ${exercice.an} : cette commune ne doit rien.`
                  : `L'Observatoire publie un montant nul pour l'exercice ${exercice.an}. Ce n'est pas une donnée manquante : la source écrit zéro.`}
              </div>
            </div>
          );
          return <BarreEchelon key={i} libelle={a[1]} valeur={v.m} maximum={maxAgregat} echelon="ville" />;
        })}
        <p className="tx-note">
          La longueur des barres compare ces six montants entre eux, pour cette commune uniquement.
          Repère ne compare jamais deux communes.
        </p>
        {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url="https://data.ofgl.fr/" /> : null}
      </Carte>

      {rr.length >= 2 ? (
        <Carte echelon="dept" titre="Ce que ces chiffres veulent dire"
          sousTitre={`Les mêmes comptes, exercice ${exercice.an}, rapportés les uns aux autres`}
          tag="Calcul Repère">
          <p className="tx-note tx-intro">
            Aucun de ces rapports n'est publié : Repère les calcule à partir des six montants
            ci-dessus, et explique sous chacun ce qu'il ne veut pas dire.
          </p>
          <div className="tuiles">
            {rr.map((o, i) => <Tuile key={i} k={o.l} v={o.v} n={o.d} />)}
          </div>
          <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} />
        </Carte>
      ) : (
        <Vide titre="Pas assez de montants pour traduire ces comptes."
          corps={`Les rapports se calculent à partir de plusieurs lignes à la fois ; pour l'exercice ${exercice.an}, le fichier officiel n'en porte pas assez.`} />
      )}
    </Pile>
  );
}
