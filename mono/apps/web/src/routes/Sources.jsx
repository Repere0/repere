import React from "react";
import { Carte, Source, Tuile, dateFr } from "@repere/ui";
import { INVARIANTS, PROMESSES } from "@repere/data-utils/invariants";

/* Cet écran n'est pas décoratif : il rend le produit vérifiable par son lecteur.
   Il dit d'où vient chaque chiffre, sous quelle licence, et ce que Repère
   s'interdit — y compris ce qu'il s'interdit de faire de vous. */
export default function Sources({ index, paquet }) {
  const s = (index && index.sources) || {};
  return (
    <div className="pile">
      <Carte echelon="france" titre="D'où viennent ces chiffres" sousTitre="Toutes les sources sont publiques et ouvertes">
        {s.elus ? <Source producteur={"Élus — " + s.elus.producteur} licence={s.elus.licence} maj={s.elus.maj}
          url="https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/" /> : null}
        {s.comptes ? <Source producteur={"Comptes — " + s.comptes.producteur} licence={s.comptes.licence} maj={s.comptes.maj}
          url="https://data.ofgl.fr/" /> : null}
        {s.circonscriptions ? <Source producteur={"Circonscriptions — " + s.circonscriptions.producteur}
          licence={s.circonscriptions.licence} mention={"découpage de " + s.circonscriptions.decoupage} /> : null}
        {/* Le decoupage dit dans quelle circonscription vote une commune ; le
            fichier des mandats dit qui y siege. Deux producteurs, deux lignes :
            les confondre laisserait croire que le ministere publie le nom des
            deputes, ce qu'il ne fait pas. */}
        {s.deputes ? <Source producteur={"Députés — " + s.deputes.producteur}
          licence={s.deputes.licence}
          mention={s.deputes.legislature
            ? s.deputes.legislature + "e législature, relevé le " + dateFr(s.deputes.releve_le)
            : undefined}
          url={s.deputes.url} /> : null}
        {/* Les noms des territoires ne viennent pas du meme fichier que le reste :
            ils ont leurs propres producteurs, et ils le disent. */}
        {Array.isArray(s.territoires) ? s.territoires.map((t, i) => (
          <Source key={i} producteur={"Noms des territoires — " + t.producteur}
            licence={t.licence} mention={t.portee} url={t.url} />
        )) : null}
        {/* Le nom d'une commune est une donnee comme une autre, avec son propre
            producteur : il vient du Code officiel geographique, pas du Repertoire
            national des elus, qui l'ecrit en capitales. */}
        {s.communes ? <Source producteur={"Noms des communes — " + s.communes.producteur}
          licence={s.communes.licence}
          mention={s.communes.releve_le ? "relevé le " + dateFr(s.communes.releve_le) : s.communes.portee}
          url={s.communes.url} /> : null}
        {/* LES SCRUTINS MANQUAIENT A CET ECRAN, et le defaut a ete vu a l'oeil sur
            capture, pas par une assertion : l'application affichait la position de
            vote d'un depute alors que la page qui recense les sources n'en
            nommait pas le producteur. Le controle plus bas echoue desormais si une
            source declaree dans index.json n'apparait pas ici. */}
        {s.scrutins ? <Source producteur={"Scrutins — " + s.scrutins.producteur}
          licence={s.scrutins.licence}
          mention={s.scrutins.legislature
            ? s.scrutins.legislature + "e législature, relevé le " + dateFr(s.scrutins.releve_le)
            : undefined}
          url={s.scrutins.url} /> : null}
        {/* Les projets financés portent DEUX dates, et les confondre ferait passer
            un relevé de la veille pour une publication de la veille : l'État a
            publié le `mis_a_jour_le`, Repère est allé le chercher le `releve_le`.
            L'écran des sources est le seul endroit où les deux se lisent. */}
        {s.projets ? <Source producteur={"Projets financés par l'État — " + s.projets.producteur}
          licence={s.projets.licence}
          maj={s.projets.mis_a_jour_le}
          mention={(s.projets.exercices ? "exercices " + s.projets.exercices.join(" et ") + ", " : "")
            + "relevé le " + dateFr(s.projets.releve_le)}
          url={s.projets.url} /> : null}
        <div className="tuiles">
          <Tuile k="Département ouvert" v={paquet.d} echelon="dept" />
          <Tuile k="Communes dans ce fichier" v={Object.keys(paquet.communes).length.toLocaleString("fr-FR")} />
          <Tuile k="Départements publiés" v={(index ? index.departements.length : 0).toString()} />
        </div>
        {/* La date des SOURCES et celle des FICHIERS ne sont pas la meme chose :
            l'une dit quand le ministere a publie, l'autre quand Repere a decoupe
            ce qu'il avait publie. Les confondre laisserait croire a une donnee
            plus fraiche qu'elle ne l'est. */}
        {index && index.genere_le ? (
          <p className="tx-note">
            Repère a découpé ces fichiers le {dateFr(index.genere_le)}. Cette date est
            celle du découpage, pas celle des chiffres : chaque source porte la sienne
            ci-dessus.
          </p>
        ) : null}
      </Carte>

      <Carte echelon="region" titre="Ce que Repère s'interdit" sousTitre="Huit règles, et le contrôle qui garde chacune">
        <ol className="invariants">
          {INVARIANTS.map(i => (
            <li key={i.n}>
              <b>{i.regle}</b>
              <span className="ligne-note">Gardé par : {i.garde}</span>
            </li>
          ))}
        </ol>
        {PROMESSES.map((t, i) => <p className="tx-note" key={i}>{t}</p>)}
        {/* LE SEUL CANAL DE RETOUR, ET IL EST LA PARCE QU'IL N'Y EN A PAS D'AUTRE.
            Repere ne mesure rien : ni page vue, ni clic, ni erreur remontee. C'est
            le bon choix, mais il a une consequence — un chiffre faux peut rester
            faux des mois sans que personne ici ne l'apprenne. Une adresse ecrite
            en clair est donc un instrument, pas une politesse. */}
        <p className="tx-note">
          Un chiffre vous semble faux, une source manque, quelque chose ne s'affiche pas ?
          Écrivez à <a href="mailto:repere0@protonmail.com">repere0@protonmail.com</a>.
          Repère ne mesure rien de ce que vous faites : votre message est le seul moyen
          que nous ayons de l'apprendre.
        </p>
      </Carte>

      <MentionsLegales />
    </div>
  );
}

/* MENTIONS LEGALES, CGU ET CONFIDENTIALITE — PORTEES LE 22/09/2026, ADAPTEES,
 * PAS RECOPIEES AU HASARD.
 *
 * D'OU VIENT CE TEXTE. La version validee du produit (app_repere_v18_20.html,
 * bloc id="repli-legal", ecran s-sources) sert de structure et de formulations
 * de reference — c'est le texte que le correctif du 22/09/2026 (commit
 * f55d0f5) vient de reparer en production. Il n'est PAS recopie mot pour mot :
 * deux affirmations y sont fausses pour mono/, et les ecrire quand meme aurait
 * ete le "au hasard" que cette tache interdit explicitement.
 *
 * CE QUI A ETE CORRIGE, ET POURQUOI :
 *  1. Le texte de reference decrit une cle localStorage "votre serie de jours
 *     consecutifs" (le jeu quotidien, ecran s-jeu). mono/ n'a pas de jeu et
 *     n'ecrit qu'UNE cle, "repere.departement", un code de departement. Le dire
 *     autrement aurait ete une fausse declaration de donnees personnelles.
 *  2. Le texte de reference promet un "journal public des corrections". Ce
 *     journal n'existe pas dans mono/ aujourd'hui (voir MONO_MIGRATION_AUDIT.md,
 *     bloc 3, "fil editorial") : promettre un service qui n'existe pas serait
 *     exactement le mensonge legal, meme petit, que le commentaire d'origine
 *     (ligne 3203 du fichier source) dit vouloir eviter.
 *  3. Le texte de reference nomme Netlify comme hebergeur. mono/ n'est
 *     aujourd'hui deploye NULLE PART publiquement (c'est un shadow build,
 *     voir CLAUDE.md §14) : nommer un hebergeur reel serait une affirmation
 *     non verifiee.
 *
 * CE QUI N'A PAS CHANGE : l'editeur, le contact, les personnes citees, les
 * sources et licences, la propriete intellectuelle, les conditions
 * d'utilisation et le prix sont exactement les memes engagements — ils sont
 * vrais quelle que soit la version technique du produit.
 *
 * POURQUOI UNE CARTE A PART, PAS UN REPLI DANS UN REPLI. L'ancien site
 * atteint ce texte par "Moi" -> bouton -> "Sources" -> depli automatique
 * differe (voir le onclick a 3 etapes, ligne 3073 du fichier source) : un
 * parcours qui n'existe que parce que l'ecran Moi n'existe plus dans mono/.
 * Ici, ouvrir l'onglet Sources suffit a VOIR le titre "Mentions legales" sans
 * rien deplier — c'est le test `tests/runtime.test.mjs` ("mentions legales —
 * ...") qui verifie qu'aucun clic supplementaire n'est necessaire pour cette
 * premiere marche. */
function MentionsLegales() {
  return (
    <Carte echelon="france" titre="Mentions légales, CGU et confidentialité"
      sousTitre="Ce que Repère s'engage à faire, et ce qu'il ne fait pas">
      <details className="repli" id="mentions-legales">
        <summary><span>Lire les mentions légales</span><span className="n">obligatoire</span></summary>
        <div className="repli-in">
          <p><b>Éditeur.</b> Repère est un projet individuel, aujourd'hui en bêta fermée. L'identité complète de l'éditeur, son statut juridique et son numéro d'immatriculation seront publiés ici avant toute ouverture au public et avant toute mise en vente. Ce n'est pas encore fait, et nous préférons l'écrire que le laisser deviner.</p>
          <p><b>Contact.</b> <a href="mailto:repere0@protonmail.com">repere0@protonmail.com</a> — signalement d'erreur, droit de réponse, question sur vos données. Chaque message est lu.</p>
          <p><b>Hébergement.</b> Cette version (« mono ») n'est déployée sur aucune adresse publique à ce jour : elle est comparée à la version en ligne avant toute bascule. L'hébergeur sera nommé ici dès qu'une publication réelle aura lieu.</p>
          <p><b>Données personnelles.</b> Repère ne crée aucun compte et ne collecte aucune donnée personnelle. Rien ne quitte votre appareil : il n'y a ni serveur de profils, ni traceur, ni mesure d'audience, ni revente. Une seule valeur est écrite sur cet appareil — le département que vous avez choisi, sous la clé <code>repere.departement</code> — et vous pouvez l'effacer avec les outils de votre navigateur. Un second espace, sur le même appareil, conserve les fichiers de départements déjà téléchargés pour fonctionner hors connexion (base <code>repere-donnees</code>) ; il ne contient que des fichiers publics, jamais votre identité, votre commune choisie ou votre historique de lecture — un contrôle automatisé refuse toute autre écriture. Vos droits d'accès, de rectification et d'effacement portent donc sur des données qui, pour l'essentiel, n'existent pas — c'est volontaire.</p>
          <p><b>Données des personnes citées.</b> Repère publie des données à caractère personnel concernant des personnes publiques — élus, candidats, représentants d'intérêts — issues exclusivement de sources officielles et republiées à des fins d'information du public (art. 85 du RGPD, art. 80 de la loi du 6 janvier 1978). C'est un traitement de données, et l'éditeur en est responsable. Toute personne citée peut demander l'accès, la rectification, l'effacement ou s'opposer à la publication, à l'adresse ci-dessus. Repère ne publie jamais le patrimoine d'un élu, ni aucune donnée relative à sa vie privée.</p>
          <p><b>Sources et licences.</b> Répertoire national des élus (ministère de l'Intérieur, ODbL 1.0), Code officiel géographique (INSEE), Observatoire des finances et de la gestion publique locales, data.gouv.fr, Assemblée nationale et Sénat. Chaque écran affiche le producteur et la date de mise à jour de la donnée qu'il montre.</p>
          <p><b>Propriété intellectuelle.</b> Les textes de l'application appartiennent à l'éditeur ; les données publiques restent sous la licence de leur producteur.</p>
          <p><b>Droit de réponse.</b> Toute personne citée peut en demander un à l'adresse ci-dessus. Cette version ne publie pas encore de journal public des corrections — une différence connue avec la version de référence, documentée dans <code>MONO_MIGRATION_AUDIT.md</code> — la réponse est alors traitée directement par courriel.</p>
          <p><b>Conditions d'utilisation.</b> Repère informe. Il ne conseille pas, ne représente personne, n'engage aucune collectivité et ne remplace aucun acte officiel. Les résumés sont vérifiés un par un et peuvent malgré tout comporter une erreur : en cas d'écart, la source officielle liée sous chaque carte fait foi, jamais le résumé.</p>
          <p><b>Prix.</b> Repère est gratuit, intégralement, dans cette version. Rien n'est en vente : aucun paiement n'est possible, aucun abonnement n'existe, aucun écran de paiement n'est présent dans l'application. Toute mise en vente future sera précédée de la publication de l'identité de l'éditeur et de son statut juridique, ci-dessus.</p>
        </div>
      </details>
    </Carte>
  );
}
