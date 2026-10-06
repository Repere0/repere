/* @repere/core — LE DEPARTEMENT D'UNE COMMUNE, UNE SEULE REGLE (06/10/2026).
 *
 * L'application mobile composait le departement par `insee.slice(0, 2)` : juste
 * en metropole et en Corse (2A, 2B), faux outre-mer, ou le code a trois
 * caracteres (97101 -> 971, pas 97). Le site faisait de meme dans sa recherche.
 * C'est le piege « deux endroits qui derivent la meme regle » (CONTEXTE § 9) :
 * 65 communes du Pacifique avaient deja recu un 404 pour cette raison.
 *
 * La regle est celle de scripts/extract-html.js, qui ecrit les fichiers par
 * departement : c'est elle qui decide ou vit chaque commune. tests/core.test.mjs
 * relit la fonction du script et verifie que les deux rendent le meme code. */
export function departementDe(insee) {
  const c = String(insee);
  return (c.startsWith("97") || c.startsWith("98")) ? c.slice(0, 3) : c.slice(0, 2);
}
