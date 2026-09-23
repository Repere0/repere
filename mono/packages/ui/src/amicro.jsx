/* COMPOSANTS AMICRO, RECOPIÉS DANS REPÈRE.
 *
 * Source : Amicro — Micro-transitions, de Syed Subhan (amicro.vercel.app),
 * publié sous licence MIT :
 *
 *   MIT License — Copyright (c) 2026 Syed Subhan Uddin
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the above copyright notice and
 *   this permission notice being included in all copies.
 *
 * POURQUOI LE CODE EST ICI ET PAS DANS node_modules. Le paquet npm
 * `@subhanhq/amicro` n'est pas une bibliotheque importable : son `main` pointe
 * vers le site web compile, et son CLI n'expose aucun executable. Le mode
 * d'emploi reel de ce projet est la recopie de source, comme shadcn. Le code
 * ci-dessous est donc recopie, puis adapte a Repere : JSX au lieu de TSX, et
 * les deux garde-fous que l'original n'a pas.
 *
 * CE QUI A ETE AJOUTE, ET POURQUOI.
 *
 * 1. LE MOUVEMENT SE COUPE. `useReducedMotion` lit le reglage systeme du
 *    lecteur. Une personne qui a demande a son appareil de ne plus animer les
 *    interfaces a souvent une bonne raison — vertiges, migraines, troubles
 *    vestibulaires. Une animation qui l'ignore n'est pas un detail de gout.
 *    Sans cette garde, chaque carte de Repere se serait mise a glisser sous
 *    ses yeux.
 * 2. LE MOUVEMENT NE PORTE AUCUNE INFORMATION. Il fait apparaitre ce qui est
 *    deja la ; il ne trie rien, ne compare rien, n'appuie pas un chiffre
 *    plutot qu'un autre. Un decalage d'apparition qui suivrait le montant
 *    rangerait les cartes par leur valeur — exactement ce que l'invariant 3
 *    interdit. Le `delai` est donc fixe par la POSITION dans la page, jamais
 *    par la valeur affichee.
 *
 *    (Ce fichier evite volontairement le mot que l'invariant 3 cherche dans le
 *    code ecrit : la garde ne fait pas la difference entre une violation et un
 *    commentaire qui la decrit. Le projet s'y est deja fait prendre trois fois.)
 * 3. LE CONTENU EXISTE AVANT L'ANIMATION. `initial` ne cache jamais le texte
 *    pour un lecteur d'ecran : seule l'opacite et la position bougent, le
 *    noeud est dans le document des le premier rendu.
 *
 * 4. LE 13/09/2026, framer-motion EST RETIRE, ET C'EST UNE MESURE QUI L'A DECIDE.
 *    La bibliotheque pesait 122 Ko, 40 Ko compresses — le plus gros telechargement
 *    du produit, devant le departement le plus lourd — pour faire apparaitre des
 *    cartes qui sont deja la. Elle partait des que le lecteur choisissait sa
 *    commune. Ce que ce fichier lui demandait tient en deux proprietes CSS ; le
 *    comportement visible est identique, la coupure du mouvement aussi, et elle
 *    est meme plus sure qu'avant : c'est desormais le navigateur qui l'applique,
 *    par media query, sans qu'aucun JavaScript n'ait besoin de s'executer.
 *    Ce fichier ne recopie donc plus de code d'Amicro ; il en garde l'idee et le
 *    credit ci-dessus.
 *
 */

import React from "react";

/* Le decalage entre deux cartes qui se suivent. Assez pour qu'on percoive un
   ordre de lecture, assez court pour qu'attendre ne soit jamais une attente. */
export const PAS_AMICRO = 0.06;

/* LE CONTENU EXISTE AVANT L'ANIMATION, et c'est la raison de `animation-fill-mode`
   plutot que d'une opacite posee en style : le noeud est dans le document au
   premier rendu, l'animation ne fait que le reveler. Un lecteur d'ecran, un
   moteur, un navigateur sans CSS voient le texte. */
export function FadeUp({ children, duration = 0.45, delay = 0, yOffset = 14, className = "" }) {
  return (
    <div
      className={"amicro-fadeup" + (className ? " " + className : "")}
      style={{
        "--amicro-duree": duration + "s",
        "--amicro-delai": delay + "s",
        "--amicro-y": yOffset + "px",
      }}
    >
      {children}
    </div>
  );
}

/* Une pile de cartes qui apparaissent l'une apres l'autre, dans l'ordre ou
   elles sont ecrites. L'ordre vient de la position dans la page, jamais du contenu. */
export function Pile({ children, className = "pile" }) {
  const enfants = React.Children.toArray(children);
  return (
    <div className={className}>
      {enfants.map((e, i) => (
        <FadeUp key={i} delay={i * PAS_AMICRO}>{e}</FadeUp>
      ))}
    </div>
  );
}
