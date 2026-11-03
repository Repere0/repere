# Kit testeur — Repère (bêta Île-de-France)

Version finale : 03/11/2026 (V55). Première vague : 5 testeurs. Ensuite, 20 à 30 testeurs, via Expo Go. Les crochets `[ ]` sont à remplir par le porteur avant l'envoi.

## 1. Installer Expo Go

- **iPhone :** [Expo Go sur l'App Store](https://apps.apple.com/app/expo-client/id982107779). Lien retrouvé par recherche le 03/11/2026.
- **Android :** [Expo Go sur Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent). Lien écrit d'après l'identifiant du paquet, **non rouvert ce jour** : à ouvrir une fois avant l'envoi.

Le projet utilise le SDK Expo 58 (`mono/apps/mobile/package.json`). Si Expo Go refuse le projet, c'est le premier point à contrôler. **Non vérifié sur appareil.**

## 2. Ouvrir Repère

[QR CODE : à remplacer par la capture du QR code affiché par `scripts/lancer-pour-testeurs.ps1`, générée par le porteur juste avant l'envoi.]

[ADRESSE exp:// : à recopier depuis le terminal, pour les testeurs qui ne peuvent pas scanner.]

- iPhone : scanner le QR code avec l'appareil photo.
- Android : le scanner depuis Expo Go (« Scan QR code »).
- Repère ne marche que tant que l'ordinateur du porteur reste allumé avec le script lancé.

## 3. Les 5 questions

Ce sont les questions de la première vague. Elles sont posées dans le message type (section 4), et reportées une à une dans `docs/tableau-retours.csv`.

1. En une phrase, à quoi sert Repère pour vous ?
2. Avez-vous trouvé votre commune en moins de 30 secondes ?
3. Le Repère du jour s'affiche-t-il avec au moins 2 faits ?
4. Quelle information vous a le plus marqué ? Pourquoi ?
5. Reviendriez-vous demain ? Pourquoi ?

Pour les questions 2 et 3, le testeur répond oui ou non, puis ajoute une phrase si la réponse est non. Le Repère du jour se trouve en haut de « Chez vous ». Un geste sur la bande ouvre la page complète, où le testeur peut partager ses faits, ou sa story.

Ne rien demander d'autre : ni adresse, ni téléphone, ni opinion politique.

## 4. Message type (à copier-coller)

> Bonjour [prénom],
>
> Je teste une petite application, Repère : elle montre, pour votre commune d'Île-de-France, qui décide, où va l'argent et ce qu'a voté votre député, à partir des sources officielles. Pas de compte, pas de publicité, aucune donnée personnelle collectée.
>
> Pour l'essayer (5 minutes) :
> 1. Installez Expo Go : iPhone https://apps.apple.com/app/expo-client/id982107779 · Android https://play.google.com/store/apps/details?id=host.exp.exponent
> 2. Scannez le QR code ci-joint (iPhone : avec l'appareil photo ; Android : depuis Expo Go).
> 3. Tapez le nom de votre commune.
>
> Ensuite, répondez-moi en quelques mots à ces 5 questions :
> 1. En une phrase, à quoi sert Repère pour vous ?
> 2. Avez-vous trouvé votre commune en moins de 30 secondes ?
> 3. Le Repère du jour s'affiche-t-il avec au moins 2 faits ?
> 4. Quelle information vous a le plus marqué ? Pourquoi ?
> 5. Reviendriez-vous demain ? Pourquoi ?
>
> L'application ne fonctionne que pendant les sessions de test : [créneau, par exemple « ce week-end, de 10 h à 20 h »].
>
> Merci !
> [signature] — [ADRESSE DE CONTACT]

## 5. Ce qu'on ne promet pas au testeur

- Toutes les communes de France : la bêta couvre les communes d'Île-de-France dont les données sont publiées.
- Une histoire pour chaque commune : le Repère du jour ne propose un fait historique que pour une vingtaine de villes, et seulement un jour sur trois. Chaque fait renvoie à l'article Wikipédia cité.
- Des photos d'élus : seulement après la première collecte en CI, et seulement sous licence libre.
- Des actualités locales : il n'y en a pas encore.
