# Droit à l'image des élus — ce que Repère fait, ce qui reste à valider

Date : 30/10/2026. **Ce document n'est pas un avis juridique.** Il a été rédigé par un assistant, sans juriste, à partir des sources listées en bas. Il sert à préparer la consultation d'un juriste ; il ne la remplace pas.

## a) Deux droits distincts

| | Droit d'auteur | Droit à l'image |
|---|---|---|
| Qui le détient | le **photographe** | la **personne photographiée** (l'élu) |
| Ce qui le couvre chez Repère | la licence libre de Commons (CC BY, CC BY-SA, CC0, domaine public) et le crédit affiché | **rien d'automatique** : une licence libre ne dit rien du consentement de la personne |
| Fondement | Code de la propriété intellectuelle ; licence Creative Commons | article 9 du Code civil (respect de la vie privée), dont la jurisprudence déduit le droit à l'image |

**À retenir aussi** : une photo d'une personne identifiable est une **donnée personnelle** au sens du RGPD (article 4). Publier des photos d'élus est donc aussi un traitement de données personnelles, avec ses obligations : base légale, information, droit d'opposition. Ce point est souvent oublié ; il est à poser au juriste au même titre que le droit à l'image.

## b) Le cadre pour un élu (personne publique)

- **En principe**, toute utilisation de l'image d'une personne identifiable demande son autorisation, expresse ou, si elle est tacite, évidente et prouvable.
- **Exception d'information** : la jurisprudence admet une publication sans consentement quand elle contribue à l'information du public : actualité, sujet d'intérêt général. Les juges pèsent plusieurs critères : la contribution à un débat d'intérêt général, la notoriété de la personne, l'objet de la publication, son contenu, sa forme et ses conséquences, les circonstances de la prise de vue. Cette exception est toujours limitée par le **respect de la dignité** de la personne.
- **Usage commercial ou publicitaire** : exclu de l'exception d'information. Il faut l'accord de la personne.
- **Un service civique non commercial qui montre un élu dans l'exercice de son mandat** se rapproche de l'exception d'information. **Mais aucune source lue pour ce document ne tranche ce cas précis** : c'est une zone grise, à faire qualifier par un juriste. Deux questions : l'application est-elle « commerciale » (gratuité, modèle économique futur) ? Une fiche permanente relève-t-elle de « l'information » au même titre qu'un article ?

## c) Ce que Repère fait déjà

- **Contexte informatif** : la photo n'apparaît que sur la fiche d'un élu, à côté de faits de mandat sourcés. Jamais dans une publicité ni une carte de partage promotionnelle.
- **Crédit visible** : « Photo : [auteur] · [licence] · Wikimedia Commons (recadrée) », sous la photo.
- **Lien vers la page Commons** : le crédit est cliquable (bloc 2 de V18).
- **Seulement des licences libres**, jamais les photos de l'Assemblée (D1, D27).
- **Rapprochement double** (identifiant ou commune, plus le nom) : pas de photo d'un homonyme.
- **Pas d'appel à Wikimedia à l'affichage** : aucune donnée du lecteur ne part chez un tiers.
- **Retrait** : chaque photo peut être retirée en supprimant son entrée des données ; les initiales reprennent sa place (procédure : `docs/data/photos-elus.md`).

## d) Ce que le CEO doit faire

1. **Consulter un juriste** : association de juristes pour le numérique civique, avocat pro bono, clinique juridique d'une faculté. Questions à poser :
   - la publication relève-t-elle de l'exception d'information ?
   - Repère est-il un service « commercial » ?
   - quelle base légale RGPD (intérêt légitime, mission d'information) ?
   - quelle information donner aux élus ?
2. **Ajouter la mention de retrait** sous chaque photo : « Photo sous licence libre, but informatif. Retrait sur demande : [adresse de contact] ». C'est déjà dans le code : elle s'affiche dès que `EXPO_PUBLIC_CONTACT_EMAIL` est renseigné (bloc 2).
3. **S'engager sur un délai de retrait** (proposé : 48 h). Cet engagement est celui du porteur, pas une promesse du code.
4. **Ne pas activer les photos en production** (fusion sur `main`, qui lance la collecte) avant la réponse du juriste, si le doute persiste.

## e) Sources

- Code civil, article 9 (« Chacun a droit au respect de sa vie privée ») : [Légifrance](https://www.legifrance.gouv.fr/codes/id/LEGIARTI000006419292/1803-08-03).
- L. Martin et A. Lefèvre, « Les collectivités face au droit à l'image », *Les cahiers juridiques de la Gazette* (Seban Avocats) : fondement (article 9, RGPD article 4), consentement exprès ou tacite évident, exception d'information et ses critères, limite de la dignité. Décisions citées : Cass. 1re civ., 5 avril 2012, n° 11-15.328 (personne non identifiable) ; Cass. 1re civ., 22 octobre 2009, n° 08-10.557 ; Cass. 1re civ., 11 mai 2022, n° 20-23.390 ; Cass. ass. plén., 7 mai 2004, n° 02-10.450 (image des biens). [PDF](https://www.seban-associes.avocat.fr/wp-content/uploads/2025/12/Lucile-Martin-et-Audrey-Lefevre-Les-collectivites-face-au-droit-a-limage-Les-cahiers-juridiques-de-la-Gazette.pdf).
- **Loi du 29 juillet 1881 sur la liberté de la presse** : citée par la brief. Elle encadre la liberté d'informer, mais **je n'ai pas lu de disposition de cette loi propre à l'image des élus**. À faire préciser par le juriste, plutôt que de l'invoquer ici.
- **Jurisprudence propre aux élus photographiés dans l'exercice de leurs fonctions** : non trouvée dans les sources lues. À demander au juriste.
