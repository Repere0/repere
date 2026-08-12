# Publier Repère sur le Play Store — dossier prêt à déposer

Arbitrage retenu : **Play Store (25 € une seule fois) + PWA installable sur iOS.**
Apple demande 99 € par an, une dépense qui se reconduit, et sa règle de « fonctionnalité
minimale » rend l'acceptation d'un habillage web incertaine, d'autant que le contenu est
politique. Sur les 100 € engageables, il reste donc 75 € après ce dépôt, et la porte Apple
reste ouverte plus tard sans que rien n'ait à être refait : l'app iOS est déjà installable
depuis Safari aujourd'hui.

---

## 1. Ce qui est déjà prêt

| Élément | État | Où |
|---|---|---|
| Application | prête | `pwa/index.html` (généré depuis `app_repere_v18.html`) |
| Manifeste | prêt | `pwa/manifest.webmanifest` |
| Service worker | prêt | `pwa/sw.js` |
| Icônes 192 / 512 / 512 maskable | prêtes | `pwa/icones/` |
| Politique de confidentialité | prête | `pwa/confidentialite.html` |
| Page de présentation (PC) | prête | `repere_presentation.html` |

## 2. Ce qui manque, et que seul le fondateur peut faire

1. **Un nom de domaine et un hébergement HTTPS.** Le contenu de `pwa/` est statique :
   n'importe quel hébergeur de pages statiques gratuit convient. L'URL doit être stable,
   car elle sera inscrite dans le lien de vérification numérique de l'application.
2. **Un compte développeur Google Play** — 25 €, un seul paiement, à vie.
   Une vérification d'identité est demandée ; compter quelques jours.
3. **La signature de l'application** — laisser Google gérer la clé (*Play App Signing*).

## 3. Fabriquer le binaire (TWA)

Une *Trusted Web Activity* affiche le site en plein écran, sans barre de navigateur : la
même application, empaquetée. Bubblewrap fait le travail :

```
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://VOTRE-DOMAINE/manifest.webmanifest
bubblewrap build
```

Répondre aux questions ainsi :

- **Application ID** : `fr.repere.app` (il ne changera plus jamais — le choisir une fois)
- **Nom** : `Repère`
- **Couleur de la barre d'état** : `#F1EDE4` (celle du manifeste, pour ne pas clignoter)
- **Icône** : `pwa/icones/repere-512.png`
- **Icône maskable** : `pwa/icones/repere-512-maskable.png`
- **Orientation** : portrait

`bubblewrap build` produit `app-release-bundle.aab` — c'est ce fichier qui est déposé.

**Le lien numérique.** Bubblewrap génère un fichier `assetlinks.json` : il doit être servi
à l'adresse `https://VOTRE-DOMAINE/.well-known/assetlinks.json`. Sans lui, l'application
s'ouvre avec la barre d'adresse du navigateur visible — ce n'est pas un refus, c'est laid.
L'empreinte à y inscrire est celle de la clé **de Google**, disponible dans la console une
fois le bundle déposé : ce fichier se met donc à jour *après* le premier dépôt.

## 4. Section « Sécurité des données » — les réponses

C'est la partie où la plupart des applications mentent par omission. Ici, les réponses
sont simples parce que la conception les rend simples.

- **Votre application collecte-t-elle des données ?** → **Non**
  *(Depuis le 11 août 2026, l'app écrit une seule valeur sur l'appareil : un compteur de
  jours consécutifs, sous la clé `repere.serie`. Le formulaire Google porte sur les
  données **collectées ou partagées**, c'est-à-dire transmises hors de l'appareil — ce
  compteur ne l'est jamais, il n'existe aucun serveur qui le connaisse, et il ne contient
  ni identifiant, ni commune, ni historique. La réponse « non » reste donc exacte. Si la
  revue pose la question, la réponse tient en une phrase : rien ne quitte le téléphone.)*
- **Votre application partage-t-elle des données avec des tiers ?** → **Non**
- **Les données sont-elles chiffrées en transit ?** → sans objet (aucune donnée transmise)
- **L'utilisateur peut-il demander la suppression de ses données ?** → sans objet (aucune donnée conservée)
- **URL de la politique de confidentialité** → `https://VOTRE-DOMAINE/confidentialite.html`

Point d'attention : le formulaire distingue *collecte* et *stockage sur l'appareil*. Le cache
du service worker ne contient que les fichiers de l'application, jamais d'information sur
l'utilisateur : il ne relève d'aucune des catégories du formulaire.

**Les réactions.** Tant que la constante `REACT_URL` est vide dans l'app, aucune réaction
n'est envoyée et les réponses ci-dessus sont vraies au sens le plus littéral : l'app
n'ouvre aucune connexion. Une fois le compteur déployé, ce qui part est l'identifiant de la
décision et le type de réaction — aucun identifiant d'utilisateur, aucun cookie, aucune IP
conservée, aucun horodatage. Google demande de déclarer les **données à caractère
personnel** : un compteur agrégé sans identifiant n'en est pas, donc la réponse « aucune
donnée collectée » reste exacte. Ce raisonnement doit être tenable à l'oral si la revue
pose la question — d'où le refus, écrit dans `serveur/worker.js` et dans le schéma, de
stocker quoi que ce soit qui permettrait de relier deux réactions entre elles.

Un réglage conditionne cette réponse et il est facile à oublier : **désactiver les journaux
d'accès Cloudflare** sur le service. La plateforme journalise l'adresse IP par défaut, et
elle le ferait à la place du code, sans qu'une ligne ait changé.

## 5. Classification du contenu

Répondre au questionnaire IARC : aucune violence, aucun contenu sexuel, aucune substance,
aucun jeu d'argent, aucun contenu généré par les utilisateurs, aucune messagerie, aucun
partage de position. Le résultat attendu est **3+ / PEGI 3**.

**Élections et contenu politique.** Google applique une politique spécifique aux applications
liées aux élections. Repère n'en relève pas : il ne fait ni publicité électorale, ni appel au
vote, ni collecte de dons, ni classement de candidats. Il présente des décisions publiques
sourcées. Le mentionner spontanément dans la fiche est inutile ; savoir le répondre en cas de
question de l'équipe de revue est nécessaire — la formulation exacte figure au §8.

## 6. La fiche du magasin

**Titre** (30 caractères max)
```
Repère — la vie publique
```

**Description courte** (80 caractères max)
```
Les décisions publiques près de chez vous. Résumées, sourcées, sans opinion.
```

**Description complète**
```
Repère répond à une question simple : qu'est-ce qui a été décidé près de chez moi, et
qu'est-ce que ça change pour moi ?

De votre conseil municipal à l'Assemblée nationale, chaque décision est résumée en
quelques phrases claires, sans jargon, avec le lien vers le document officiel juste
en dessous. Vous n'avez pas à nous croire : la source est toujours là.

CE QUE VOUS TROUVEZ
• Le fil des décisions qui vous concernent, de la commune au national
• Qui décide de quoi : la commune, l'agglomération, le département, la région, l'État
• Les fiches des élus, avec leurs mandats et les liens officiels
• Un dictionnaire des mots de la vie publique, en français courant
• Un jeu de questions pour se repérer sans y passer la soirée
• Le calendrier des échéances à venir

CE QUE NOUS NE FAISONS PAS
Pas de classement des élus, des partis ou des territoires. Pas de vote attribué à
quelqu'un sans confirmation. Le même gabarit graphique pour toutes les familles
politiques. Et quand une information nous manque, nous l'écrivons — plutôt que
d'afficher un graphique qui ferait semblant.

AUCUNE DONNÉE COLLECTÉE
Pas de compte, pas d'e-mail, pas de publicité, pas de traceur. L'application
fonctionne hors connexion : elle n'interroge aucun serveur. Il n'y a rien à vendre
parce qu'il n'y a rien à collecter.

Les données proviennent des jeux de données publics de l'administration française.
```

**Catégorie** : Actualités et magazines · **Étiquettes** : actualités, éducation, gouvernement
**Adresse e-mail de contact** : arthurpinardpro@gmail.com

## 7. Les captures d'écran à fournir

Minimum exigé : 2 captures de téléphone, en 16:9 ou 9:16, au moins 320 px de côté.
En fournir 5, dans cet ordre — la première est la seule que la plupart des gens verront :

1. Le fil des décisions
2. Une décision dépliée, avec son lien source
3. « Qui décide de quoi », l'écran des échelons
4. Une fiche d'élu
5. Le jeu

À produire depuis `pwa/index.html` en mode installé (393 × 852), le cadre de téléphone
dessiné étant justement masqué dans ce mode.

Il faut aussi une **icône de 512 × 512** (`pwa/icones/repere-512.png`) et une **bannière
de 1024 × 500**. Cette bannière n'existe pas encore : c'est le seul élément graphique
manquant du dossier.

## 8. À savoir avant d'appuyer sur « Envoyer »

- **Le premier examen prend plusieurs jours**, parfois deux semaines pour un compte neuf.
  Le prévoir dans le calendrier : viser une notoriété avant 2027 laisse de la marge, mais
  pas si le dépôt attend le dernier moment.
- **Ouvrir en test fermé d'abord.** Une dizaine de testeurs, une semaine. C'est aussi une
  exigence pour les comptes personnels créés récemment.
- **Le prix.** L'arbitrage produit prévoit un paiement unique (4,99 € / 9,99 €). Publier
  d'abord en gratuit est plus prudent : un prix se change en une minute, une mauvaise
  première impression sur un magasin, non. Rien dans le dossier ne dépend de ce choix.
- **Si la revue interroge sur le contenu politique**, la réponse tient en trois phrases :
  Repère ne fait aucune publicité électorale et ne sollicite ni vote ni don ; il présente
  des données publiques ouvertes de l'administration française avec un lien vers chaque
  source ; il ne produit aucun classement d'élus, de partis ou de territoires.
