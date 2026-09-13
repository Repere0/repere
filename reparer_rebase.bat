@echo off
rem ============================================================================
rem  Repere - sortir le depot du rebase bloque, et fusionner proprement.
rem  A LANCER UNE FOIS, par double-clic. Ne demande rien, s arrete a la moindre
rem  erreur, et explique ce qu il fait a chaque etape.
rem
rem  CE QUI S EST PASSE, releve dans .git le 13/09/2026 :
rem
rem    pousser.bat fait « git pull --rebase origin main » A CHAQUE EXECUTION,
rem    meme quand on travaille sur une AUTRE branche. Tant que main suivait la
rem    branche, ca ne se voyait pas. Depuis qu un commit a ete pousse sur main
rem    (fix(web): corrige le chargement des deputes), chaque passage horaire
rem    tente de rebaser les dix commits de la branche sur main.
rem
rem    A 4h38, ce rebase a bute sur un conflit dans App.jsx, a l etape 2 sur 10.
rem    Le depot est reste EN COURS DE REBASE : HEAD detache, App.jsx porte
rem    quatre marqueurs de conflit, et plus rien ne peut etre commite ni pousse.
rem    Toutes les executions horaires suivantes echouent sur « ECHEC pull ».
rem
rem  CE QUE FAIT CE SCRIPT :
rem    1. annule le rebase (le travail non commite revient tout seul) ;
rem    2. enregistre ce qui n etait pas encore commite ;
rem    3. fusionne main dans la branche EN GARDANT la version eprouvee d App.jsx
rem       (celle de main y reintroduit un chargement de 54 Ko des l ouverture,
rem       que le banc interdit, et casse le fichier : chargerDeputes n y est
rem       plus importe) ;
rem    4. avance main jusqu a la branche, et pousse les deux.
rem ============================================================================
cd /d "%~dp0"
setlocal

echo.
echo   [1/6] Annulation du rebase bloque...
git rebase --abort
if errorlevel 1 (
  echo   Aucun rebase en cours, ou annulation impossible. On continue.
)

git rev-parse --abbrev-ref HEAD > "%TEMP%\repere_br.txt"
set /p BRANCHE=< "%TEMP%\repere_br.txt"
echo   Branche courante : %BRANCHE%
if not "%BRANCHE%"=="audit-finalisation-repere" (
  echo   Retour sur la branche de travail...
  git checkout audit-finalisation-repere
  if errorlevel 1 goto :echec
)

echo.
echo   [2/6] Enregistrement de ce qui n etait pas encore commite...
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Travaux en cours avant fusion de main"
  if errorlevel 1 goto :echec
) else (
  echo   Rien a enregistrer.
)

echo.
echo   [3/6] Recuperation de main...
git fetch origin
if errorlevel 1 goto :echec

echo.
echo   [4/6] Fusion de main, en gardant la version eprouvee d App.jsx...
git merge origin/main --no-commit --no-ff
rem Un conflit ICI est ATTENDU : c est exactement le fichier qu on veut garder.
git checkout HEAD -- mono/apps/web/src/App.jsx
if errorlevel 1 goto :echec
git add -A
git commit -m "Fusionne main : garde la version eprouvee de App.jsx"
if errorlevel 1 (
  echo   Rien a fusionner : main etait deja integre.
)

echo.
echo   [5/6] Avance de main jusqu a la branche...
git checkout main
if errorlevel 1 goto :echec
git merge --ff-only audit-finalisation-repere
if errorlevel 1 (
  echo.
  echo   ECHEC : main ne peut pas avancer sans fusion. Ne force rien.
  echo   Envoie cette sortie a Claude.
  goto :echec
)
git push
if errorlevel 1 goto :echec

echo.
echo   [6/6] Retour sur la branche et envoi...
git checkout audit-finalisation-repere
if errorlevel 1 goto :echec
git push
if errorlevel 1 goto :echec

echo.
echo   ================================================================
echo   OK. Le rebase est annule, main est a jour, tout est pousse.
echo   Verifie : https://github.com/Repere0/repere/commits/main
echo   ================================================================
timeout /t 25 >nul
exit /b 0

:echec
echo.
echo   ARRET. Rien de destructeur n a ete fait. Copie la sortie ci-dessus
echo   et envoie-la a Claude.
timeout /t 60 >nul
exit /b 1
