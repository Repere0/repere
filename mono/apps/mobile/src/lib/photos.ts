/* PHOTOS D'ELUS (D27, ADR 0004) : lues dans data/photos-elus/{dep}.json, un fichier par
 * departement produit par la chaine (scripts/collecte-photos-elus.mjs). Jamais d'appel a
 * Wikimedia depuis l'application (invariant 2). Sans fichier ou sans photo : null, et
 * l'avatar garde ses initiales. */
import { useEffect, useState } from "react";
import { chargerPhotosElus } from "./donnees";

export type PhotoElu = { data: string; auteur: string; licence: string; licence_url?: string | null; page?: string | null };

export function usePhotoElu(dep: string | null | undefined, cle: string | null | undefined): PhotoElu | null {
  const [p, setP] = useState<PhotoElu | null>(null);
  useEffect(() => {
    setP(null);
    if (!dep || !cle) return undefined;
    let vivant = true;
    try {
      chargerPhotosElus(dep).then(r => {
        const x = r.donnees ? (r.donnees as { photos?: Record<string, PhotoElu> }).photos?.[cle] : undefined;
        if (vivant && x && /^data:image\//.test(x.data) && x.auteur && x.licence) setP(x);
      }).catch(() => {});
    } catch { /* code de departement refuse par la fabrique d'adresses : pas de photo */ }
    return () => { vivant = false; };
  }, [dep, cle]);
  return p;
}
