@echo off
rem ============================================================================
rem  Repere - poser la phase 2, remettre main a jour, et arreter le cercle vicieux.
rem  UN SEUL DOUBLE-CLIC. Tout est journalise dans journal_phase2.txt.
rem
rem  CE QUI S EST PASSE DEPUIS CE MATIN, lu dans .git :
rem    - 4h38 : pousser.bat rebasait la branche sur main a chaque execution. Le
rem      rebase a bute sur App.jsx et a laisse le depot bloque.
rem    - reparer_rebase.bat a debloque : rebase annule, travaux enregistres, main
rem      fusionne dans la branche en gardant la bonne version d App.jsx.
rem    - Il s est arrete a l avance de main, en laissant le depot SUR main.
rem    - 12h38 : la tache horaire s est donc executee SUR MAIN, y a commite un
rem      fichier et l a pousse. main a re-diverge. C est un cercle : tant que
rem      pousser.bat tourne sur main, main avance sans la branche.
rem
rem  CE SCRIPT :
rem    1. se remet sur la branche de travail ;
rem    2. y integre main (qui n apporte qu un fichier, aucun conflit attendu) ;
rem    3. pose les seize fichiers de la phase 2, dont pousser.bat VERSION 6 — qui
rem       ne rebase plus jamais une branche de travail sur main ;
rem    4. enregistre, envoie la branche, avance main, envoie main ;
rem    5. revient sur la branche, pour que la tache horaire y travaille.
rem ============================================================================
cd /d "%~dp0"
set "J=%~dp0journal_phase2.txt"
> "%J%" echo ===== appliquer_phase2 %DATE% %TIME% =====

echo.
echo   Application de la phase 2. Detail dans journal_phase2.txt.
echo.

>> "%J%" echo --- [1] retour sur la branche de travail ---
git checkout audit-finalisation-repere >> "%J%" 2>&1
if errorlevel 1 goto :echec
git rev-parse --abbrev-ref HEAD >> "%J%" 2>&1

>> "%J%" echo --- [2] integration de main ---
git fetch origin >> "%J%" 2>&1
if errorlevel 1 goto :echec
git merge origin/main -m "Integre main dans la branche de travail" >> "%J%" 2>&1
if errorlevel 1 (
  >> "%J%" echo Conflit : on garde la version eprouvee des fichiers de la branche.
  git checkout --ours . >> "%J%" 2>&1
  git add -A >> "%J%" 2>&1
  git commit -m "Integre main : garde la version eprouvee de la branche" >> "%J%" 2>&1
)

>> "%J%" echo --- [3] pose des fichiers de la phase 2 ---
if not exist "_phase2\" (
  >> "%J%" echo ECHEC : le dossier _phase2 est introuvable.
  goto :echec
)
xcopy "_phase2\*" "%~dp0" /E /Y /Q >> "%J%" 2>&1
if errorlevel 1 goto :echec
rmdir /s /q "_phase2"
>> "%J%" echo fichiers poses, dossier _phase2 supprime.

>> "%J%" echo --- [4] enregistrement et envoi de la branche ---
git add -A >> "%J%" 2>&1
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Phase 2 : entree par commune, votes lisibles, echelons, plancher 13 px, retour Android" >> "%J%" 2>&1
  if errorlevel 1 goto :echec
) else (
  >> "%J%" echo Rien de nouveau a enregistrer.
)
git push >> "%J%" 2>&1
if errorlevel 1 (
  >> "%J%" echo push simple refuse, tentative avec amont
  git push -u origin HEAD >> "%J%" 2>&1
  if errorlevel 1 goto :echec
)

>> "%J%" echo --- [5] avance de main ---
git checkout main >> "%J%" 2>&1
if errorlevel 1 goto :echec
git merge --ff-only audit-finalisation-repere >> "%J%" 2>&1
if errorlevel 1 (
  >> "%J%" echo ECHEC ff-only : main n a pas ete avance. Rien de destructeur n a ete fait.
) else (
  git push >> "%J%" 2>&1
  if errorlevel 1 ( >> "%J%" echo ECHEC push main ) else ( >> "%J%" echo OK main avance et pousse )
)

>> "%J%" echo --- [6] retour sur la branche de travail ---
git checkout audit-finalisation-repere >> "%J%" 2>&1

>> "%J%" echo --- etat final ---
git rev-parse --abbrev-ref HEAD >> "%J%" 2>&1
git log --oneline -3 >> "%J%" 2>&1
git status --porcelain >> "%J%" 2>&1
>> "%J%" echo ===== fin =====
echo.
echo   Termine. Claude va lire journal_phase2.txt.
timeout /t 20 >nul
exit /b 0

:echec
>> "%J%" echo ===== ARRET SUR ERREUR =====
git rev-parse --abbrev-ref HEAD >> "%J%" 2>&1
git status --porcelain >> "%J%" 2>&1
echo.
echo   ARRET sur erreur. Rien de destructeur n a ete fait.
echo   Claude va lire journal_phase2.txt.
timeout /t 30 >nul
exit /b 1
