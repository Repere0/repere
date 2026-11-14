/* /bienvenue n'est plus un écran (14/11/2026, ADR 0011) : la bienvenue est une barrière posée par la coquille
   (_layout.tsx, ui/bienvenue.tsx) tant qu'aucun prénom n'est gardé. L'adresse reste, pour qu'un ancien lien ne
   tombe pas sur une page introuvable : elle ramène à l'accueil — où la barrière se dresse si elle doit l'être. */
import { Redirect } from "expo-router";

export default function AncienneBienvenue() {
  return <Redirect href="/" />;
}
