import React, { useMemo, useState } from "react";
import { Carte, Vide, Tuile, BarreEchelon, Source } from "@repere/ui";

/* Le tableau plat des comptes : [population, montant0, parHab0, montant1, ...].
   Six agrégats, deux valeurs chacun. La forme vient du fichier officiel ; on ne
   la devine pas, meta.agregats la porte. */
function valeur(ex, i) {
  if (!Array.isArray(ex)) return null;
  const m = ex[1 + i * 2], h = ex[2 + i * 2];
  const mm = typeof m === "number" && m !== 0 ? m : null;
  const hh = typeof h === "number" && h !== 0 ? h : null;
  return mm === null && hh === null ? null : { m: mm, hab: hh };
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
    l: "Sa dette",
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

export default function OuVaArgent({ paquet, index }) {
  const [filtre, setFiltre] = useState("");
  const [choisie, setChoisie] = useState(null);
  const agregats = (index && index.agregats) || [];
  const src = index && index.sources ? index.sources.comptes : null;

  const vues = useMemo(() => {
    const q = filtre.trim().toLowerCase();
    return Object.entries(paquet.communes)
      .filter(([, c]) => c.comptes && (!q || c.nom.toLowerCase().includes(q)))
      .sort((a, b) => a[1].nom.localeCompare(b[1].nom, "fr"))
      .slice(0, 60);
  }, [paquet, filtre]);

  const c = choisie ? paquet.communes[choisie] : null;
  const exercice = useMemo(() => {
    if (!c || !c.comptes) return null;
    const ans = Object.keys(c.comptes).filter(a => /^\d{4}$/.test(a)).sort();
    for (let i = ans.length - 1; i >= 0; i--) {
      if (agregats.some((_, j) => valeur(c.comptes[ans[i]], j))) return { an: ans[i], ex: c.comptes[ans[i]] };
    }
    return null;
  }, [c, agregats]);

  const rr = exercice ? rapports(exercice.ex) : [];
  const maxAgregat = exercice
    ? Math.max(...agregats.map((_, i) => (valeur(exercice.ex, i) || {}).m || 0))
    : 0;

  return (
    <div className="pile">
      <label className="champ">
        <span>Les comptes d'une commune du département {paquet.d}</span>
        <input type="search" value={filtre} placeholder="Ustaritz, Bayonne…"
          onChange={e => { setFiltre(e.target.value); setChoisie(null); }} />
      </label>

      <div className="rangee liste">
        {vues.map(([insee, com]) => (
          <button key={insee} type="button"
            className={"puce" + (insee === choisie ? " actif" : "")}
            onClick={() => setChoisie(insee)}>{com.nom}</button>
        ))}
      </div>

      {c && !exercice ? (
        <Vide titre={`Les comptes de ${c.nom} ne figurent pas dans le fichier officiel.`}
          corps="Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux."
          lien={{ texte: "Consulter les comptes", url: "https://data.ofgl.fr/" }} />
      ) : null}

      {c && exercice ? (
        <>
          <Carte echelon="ville" titre={c.nom} sousTitre={`Comptes de l'exercice ${exercice.an}${population(exercice.ex) ? ` · ${population(exercice.ex).toLocaleString("fr-FR")} habitants` : ""} · budget principal`} tag="Chiffres vérifiés">
            {agregats.map((a, i) => {
              const v = valeur(exercice.ex, i);
              if (!v) return (
                <div className="ligne" key={i}>
                  <div className="ligne-h"><span>{a[1]}</span><b>—</b></div>
                  <div className="ligne-note">Non renseigné pour l'exercice {exercice.an}.</div>
                </div>
              );
              return <BarreEchelon key={i} libelle={a[1]} valeur={v.m} maximum={maxAgregat} echelon="ville" />;
            })}
            {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url="https://data.ofgl.fr/" /> : null}
          </Carte>

          {rr.length >= 2 ? (
            <Carte echelon="dept" titre="Ce que ces chiffres veulent dire"
              sousTitre={`Les mêmes comptes, exercice ${exercice.an}, rapportés les uns aux autres`}>
              <div className="tuiles">
                {rr.map((o, i) => <Tuile key={i} k={o.l} v={o.v} n={o.d} />)}
              </div>
              <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} />
            </Carte>
          ) : (
            <Vide titre="Pas assez de montants pour traduire ces comptes."
              corps={`Les rapports se calculent à partir de plusieurs lignes à la fois ; pour l'exercice ${exercice.an}, le fichier officiel n'en porte pas assez.`} />
          )}
        </>
      ) : null}
    </div>
  );
}
