@echo off
rem ============================================================================
rem  Reparation unique, a lancer une seule fois apres l echec du 20/08/2026.
rem
rem  CE QU IL FAIT, dans cet ordre :
rem   1. efface la reference MERGE_AUTOSTASH restee coincee ;
rem   2. retire journal_pousser.txt du suivi de git, sans effacer le fichier ;
rem   3. enregistre ce retrait ;
rem   4. recupere les commits du robot ;
rem   5. repose le workflow v4 par-dessus.
rem  Il n efface aucun travail : la seule modification locale perdue est la copie
rem  du workflow, que l etape 5 refait a l identique depuis docs/.
rem ============================================================================
cd /d "%~dp0"
echo [1/5] Effacement de la reference coincee...
git update-ref -d MERGE_AUTOSTASH 2>nul
git rebase --abort 2>nul

echo [2/5] Retrait du journal du suivi de git...
git rm --cached journal_pousser.txt

echo [3/5] Enregistrement...
git add .gitignore
git commit -m "Le journal de pousser.bat ne doit pas etre suivi par git"
if errorlevel 1 echo (rien a enregistrer, ce n est pas une erreur)

echo [4/5] Recuperation des commits du robot...
git pull --rebase origin main
if errorlevel 1 (
  echo ECHEC. Envoie la sortie ci-dessus a Claude, ne rattrape rien a la main.
  pause
  exit /b 1
)

echo [5/5] Remise en place du workflow v4...
copy /Y docs\collecte_workflow_v4.yml.txt .github\workflows\collecte.yml
findstr /C:"version 4" .github\workflows\collecte.yml
if errorlevel 1 (
  echo ATTENTION : le workflow v4 n a pas ete reconnu. Dis-le a Claude.
  pause
  exit /b 1
)

echo.
echo Repare. Lance maintenant pousser.bat.
pause
