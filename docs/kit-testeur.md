# Kit testeur — Repère (bêta Île-de-France)

Date : 30/10/2026. Pour 20 à 30 testeurs, via Expo Go. À compléter par le porteur aux endroits entre crochets.

## 1. Installer Expo Go

- **iPhone :** [Expo Go sur l'App Store](https://apps.apple.com/FR/app/id982107779)
- **Android :** [Expo Go sur Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

Le projet utilise le SDK Expo 58 (`mono/apps/mobile/package.json`). La version d'Expo Go des magasins n'ouvre qu'une version du SDK à la fois. **Non vérifié sur appareil** : si Expo Go refuse le projet, c'est le premier point à contrôler.

## 2. Ouvrir Repère

[QR CODE : à remplacer par la capture du QR code affiché par `scripts/lancer-pour-testeurs.ps1`]

[ADRESSE exp:// : à recopier depuis le terminal, pour les testeurs qui ne peuvent pas scanner]

- iPhone : scanner le QR code avec l'appareil photo.
- Android : le scanner depuis Expo Go (« Scan QR code »).
- L'application ne marche que tant que l'ordinateur du porteur reste allumé avec le script lancé.

## 3. Les 5 questions

Les questions 1 à 3 viennent de `docs/testeurs.md`. Les questions 4 et 5 sont ajoutées ici, pour les objectifs « compris en 5 secondes » et « envie de revenir ».

1. Quelle commune avez-vous testée, et est-ce la vôtre ou celle d'un proche ?
2. Qu'est-ce qui ne marche pas ? (l'écran, et ce que vous avez fait juste avant)
3. Quel écran, quel mot ou quelle phrase n'avez-vous pas compris ?
4. En regardant l'écran de votre commune pendant 5 secondes, qu'avez-vous retenu ?
5. Reviendriez-vous dans une semaine ? Pour voir quoi ?

Ne rien demander d'autre : ni adresse, ni téléphone, ni opinion politique (`docs/testeurs.md`).

## 4. Message type (à copier-coller)

> Bonjour [prénom],
>
> Je teste une petite application, Repère : elle montre, pour votre commune d'Île-de-France, qui décide, où va l'argent et ce qu'a voté votre député, à partir des sources officielles. Pas de compte, pas de publicité, aucune donnée personnelle collectée.
>
> Pour l'essayer (5 minutes) :
> 1. Installez Expo Go : iPhone https://apps.apple.com/FR/app/id982107779 · Android https://play.google.com/store/apps/details?id=host.exp.exponent
> 2. Scannez le QR code ci-joint (iPhone : avec l'appareil photo ; Android : depuis Expo Go).
> 3. Tapez le nom de votre commune.
>
> Ensuite, répondez-moi en quelques mots à ces 5 questions :
> 1. Quelle commune avez-vous testée ?
> 2. Qu'est-ce qui ne marche pas ?
> 3. Qu'est-ce que vous n'avez pas compris ?
> 4. En 5 secondes, qu'avez-vous retenu de votre commune ?
> 5. Reviendriez-vous dans une semaine, et pour voir quoi ?
>
> L'application ne fonctionne que pendant les sessions de test : [créneau, par exemple « ce week-end, de 10 h à 20 h »].
>
> Merci !
> [signature] — [ADRESSE DE CONTACT]

## 5. Ce qu'on ne promet pas au testeur

- Toutes les communes de France : la bêta couvre les 1 262 communes d'Île-de-France qui ont une fiche.
- Des photos d'élus : seulement après la première collecte en CI, et seulement sous licence libre.
- Des actualités locales : il n'y en a pas encore.
