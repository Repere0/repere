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
 */
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Le decalage entre deux cartes qui se suivent. Assez pour qu'on percoive un
   ordre de lecture, assez court pour qu'attendre ne soit jamais une attente. */
export const PAS_AMICRO = 0.06;

export function FadeUp({ children, duration = 0.45, delay = 0, yOffset = 14, className = "" }) {
  const sansMouvement = useReducedMotion();

  /* Reglage systeme respecte : on rend l'element tel quel, sans motion du tout.
     Ce n'est pas une animation a duree nulle — c'est l'absence d'animation. */
  if (sansMouvement) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
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
