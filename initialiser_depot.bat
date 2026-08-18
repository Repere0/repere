@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================================
REM  Repere - mise a l'abri du projet dans un depot git
REM
REM  Ce script NE DEPLACE RIEN et NE SUPPRIME RIEN. Il COPIE les fichiers qui
REM  comptent depuis Telechargements vers C:\Users\%USERNAME%\repere, puis il
REM  cree un depot git local et un premier enregistrement.
REM
REM  Pourquoi : le dossier Telechargements est un dossier de passage. C'est la
REM  que build_pwa.py et test_repere.mjs ont disparu. Un depot git garde
REM  l'historique de chaque version et survit a un nettoyage de disque.
REM ============================================================================

set "SOURCE=%USERPROFILE%\Downloads"
set "CIBLE=%USERPROFILE%\repere"

echo.
echo   Repere - initialisation du depot
echo   ================================
echo.
echo   Source : %SOURCE%
echo   Cible  : %CIBLE%
echo.

REM --- git est-il installe ? --------------------------------------------------
where git >nul 2>nul
if errorlevel 1 (
  echo   [ARRET] git n'est pas installe sur cette machine.
  echo.
  echo   Installe-le d'abord : https://git-scm.com/download/win
  echo   Accepte toutes les options par defaut, puis relance ce script.
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('git --version') do echo   git detecte : %%v
echo.

REM --- creation de l'arborescence ---------------------------------------------
if not exist "%CIBLE%\outils" mkdir "%CIBLE%\outils"
if not exist "%CIBLE%\site"   mkdir "%CIBLE%\site"
if not exist "%CIBLE%\docs"   mkdir "%CIBLE%\docs"

REM --- copie des fichiers qui comptent ----------------------------------------
echo   Copie des fichiers...
copy /y "%SOURCE%\app_repere_v18_13.html"   "%CIBLE%\"           >nul 2>nul
copy /y "%SOURCE%\outils\build_pwa.py"      "%CIBLE%\outils\"    >nul 2>nul
copy /y "%SOURCE%\outils\test_repere.mjs"   "%CIBLE%\outils\"    >nul 2>nul
copy /y "%SOURCE%\repere_presentation.html" "%CIBLE%\"           >nul 2>nul
copy /y "%SOURCE%\repere_deck.html"         "%CIBLE%\"           >nul 2>nul
copy /y "%SOURCE%\REPRISE.md"               "%CIBLE%\docs\"      >nul 2>nul
copy /y "%SOURCE%\PLAN_LANCEMENT_REPERE.md" "%CIBLE%\docs\"      >nul 2>nul
copy /y "%SOURCE%\Repere_Plan_Action_Data.md" "%CIBLE%\docs\"    >nul 2>nul
copy /y "%SOURCE%\docs\PLAY_STORE.md"       "%CIBLE%\docs\"      >nul 2>nul
copy /y "%SOURCE%\pwa\sw.js"                "%CIBLE%\site\"      >nul 2>nul
copy /y "%SOURCE%\pwa\manifest.webmanifest" "%CIBLE%\site\"      >nul 2>nul
copy /y "%SOURCE%\pwa\confidentialite.html" "%CIBLE%\site\"      >nul 2>nul
if not exist "%CIBLE%\site\icones" mkdir "%CIBLE%\site\icones"
copy /y "%SOURCE%\pwa\icones\*.png"         "%CIBLE%\site\icones\" >nul 2>nul

REM --- le fichier des exclusions ----------------------------------------------
REM  Les CSV sources pesent plusieurs gigaoctets : ils ne vont PAS dans git.
REM  Ils se retelechargent depuis data.gouv.fr, un depot n'est pas un entrepot.
(
echo # Donnees sources : plusieurs Go, retelechargeables depuis data.gouv.fr.
echo # Un depot garde ce qui ne se retrouve pas ailleurs, pas ce qui se retelecharge.
echo *.csv
echo ofgl-*
echo elus-*
echo.
echo # Sorties engendrees : build_pwa.py les refabrique a l'identique.
echo site_v*/
echo repere_site*.zip
echo repere_pwa*.zip
echo.
echo # Bruit de systeme
echo desktop.ini
echo Thumbs.db
echo node_modules/
) > "%CIBLE%\.gitignore"

REM --- le depot ---------------------------------------------------------------
cd /d "%CIBLE%"
if not exist ".git" (
  git init -b main >nul
  echo   Depot git cree.
) else (
  echo   Depot git deja present, on continue.
)

git add -A
git -c user.name="Repere" -c user.email="repere0@protonmail.com" ^
    commit -m "Repere v18.13 - app, generateur PWA, banc de test, documents" >nul 2>nul
if errorlevel 1 (
  echo   Rien de neuf a enregistrer ^(tout est deja a jour^).
) else (
  echo   Premier enregistrement effectue.
)

echo.
echo   ---------------------------------------------------------------
git log --oneline -1 2>nul
echo.
echo   TERMINE. Ton projet est maintenant dans :
echo     %CIBLE%
echo.
echo   Rien n'a ete supprime de Telechargements.
echo.
echo   ETAPE SUIVANTE - l'envoyer sur GitHub ^(voir le tutoriel^) :
echo     1. cree un depot PRIVE nomme "repere" sur github.com
echo     2. puis, dans ce dossier :
echo          git remote add origin https://github.com/TON-COMPTE/repere.git
echo          git push -u origin main
echo.
pause
