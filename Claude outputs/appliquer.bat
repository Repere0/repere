@echo off
setlocal enabledelayedexpansion
rem ============================================================================
rem  REPERE — APPLIQUER LES SEPT COMMITS (phases 2, 2.1, revue produit, P0)
rem
rem  VERSION 2 (14/09/2026). LA VERSION 1 AURAIT REFUSE DE TOURNER.
rem  Deux choses mesurees sur ton PC avant d'ecrire cette version :
rem    - le paquet est dans « Claude outputs », pas a cote du script : ce script
rem      va donc le chercher aux deux endroits ;
rem    - pousser.bat sur ton disque fait 11 162 octets alors que la branche en
rem      porte 7 501 : l'arbre de travail est donc SALE, et la version 1 se
rem      serait arretee a l'etape [2] en disant « modifications non
rem      enregistrees ». Le fichier de ton disque est OCTET POUR OCTET celui que
rem      le paquet apporte (v7, verifie) : on peut donc l'ecarter sans rien
rem      perdre, et ce script le fait EN LE NOMMANT, jamais avec « checkout . ».
rem
rem  CE QU'IL NE FAIT PAS : il ne commite pas sur main, ne fusionne pas dans
rem  main, ne force aucun push, n'efface aucun travail non identifie.
rem ============================================================================

set "DEPOT=C:\Users\APina\repere"
set "BRANCHE=audit-finalisation-repere"
set "JOURNAL=%DEPOT%\journal_phase21.txt"

rem --- trouver le paquet, aux deux endroits possibles ------------------------
set "PAQUET="
if exist "%~dp0repere_phase2.bundle" set "PAQUET=%~dp0repere_phase2.bundle"
if not defined PAQUET if exist "%DEPOT%\Claude outputs\repere_phase2.bundle" set "PAQUET=%DEPOT%\Claude outputs\repere_phase2.bundle"
if not defined PAQUET (
  echo   ERREUR : repere_phase2.bundle est introuvable.
  echo   Cherche a cote de ce script, et dans "%DEPOT%\Claude outputs".
  goto :fin
)

echo REPERE - application des sept commits
echo   paquet : %PAQUET%
echo.
if not exist "%DEPOT%\.git" ( echo   ERREUR : %DEPOT% n'est pas un depot git. & goto :fin )
cd /d "%DEPOT%"
echo === %DATE% %TIME% ===> "%JOURNAL%"
echo paquet : %PAQUET%>> "%JOURNAL%"

rem --- [1] le paquet est-il sain ? -------------------------------------------
echo   [1] verification du paquet...
git bundle verify "%PAQUET%" >> "%JOURNAL%" 2>&1
if errorlevel 1 (
  echo   ARRET : paquet abime, ou le depot ne porte pas le commit de base 8b4ffe0.
  echo   Rien n'a ete modifie.
  goto :fin
)

rem --- [2] ecarter pousser.bat s'il est le seul obstacle ---------------------
echo   [2] etat du depot...
git status --porcelain > "%TEMP%\rep_sale.txt" 2>&1
type "%TEMP%\rep_sale.txt" >> "%JOURNAL%"
rem Compter les lignes, et celles qui ne concernent PAS pousser.bat.
set /a TOTAL=0
set /a AUTRES=0
for /f "usebackq delims=" %%L in ("%TEMP%\rep_sale.txt") do (
  set /a TOTAL+=1
  echo %%L | findstr /i /c:"pousser.bat" >nul || set /a AUTRES+=1
)
if !TOTAL! GTR 0 (
  if !AUTRES! GTR 0 (
    echo   ARRET : le depot porte !AUTRES! modification^(s^) que je ne peux pas
    echo   identifier. Elles seraient perdues. Enregistre-les d'abord :
    echo       git add -A ^&^& git commit -m "travail en cours"
    echo   Le detail est dans %JOURNAL%.
    goto :fin
  )
  echo       pousser.bat est modifie, et le paquet apporte le meme fichier.
  echo       On l'ecarte, en le nommant.
  git checkout -- pousser.bat >> "%JOURNAL%" 2>&1
)

rem --- [3] tirer les commits -------------------------------------------------
echo   [3] lecture des sept commits...
git fetch "%PAQUET%" travail:phase21-recue >> "%JOURNAL%" 2>&1
if errorlevel 1 ( echo   ARRET : lecture du paquet impossible. Voir %JOURNAL%. & goto :fin )

rem --- [4] avancer la branche, en avance rapide uniquement -------------------
echo   [4] avance de %BRANCHE%...
git checkout %BRANCHE% >> "%JOURNAL%" 2>&1
if errorlevel 1 ( echo   ARRET : impossible de se placer sur %BRANCHE%. Voir %JOURNAL%. & goto :fin )
git merge --ff-only phase21-recue >> "%JOURNAL%" 2>&1
if errorlevel 1 (
  echo   ARRET : avance rapide impossible, la branche a diverge. Aucune fusion
  echo   automatique n'est tentee. Voir %JOURNAL%.
  goto :fin
)
git branch -D phase21-recue >> "%JOURNAL%" 2>&1

rem --- [5] pousser ------------------------------------------------------------
echo   [5] envoi vers GitHub...
git push origin %BRANCHE% >> "%JOURNAL%" 2>&1
if errorlevel 1 (
  echo   L'envoi a echoue — les sept commits sont bien dans le depot local.
  echo   Cause la plus frequente : le jeton GitHub a expire.
  echo   Voir %JOURNAL%.
  goto :fin
)

rem --- [6] brancher les gardes de main ---------------------------------------
echo   [6] branchement des gardes...
git config core.hooksPath outils/gardes >> "%JOURNAL%" 2>&1
echo       core.hooksPath = outils/gardes

echo.
echo   TERMINE. %BRANCHE% porte les sept commits et GitHub les a recus.
echo.
echo   IL RESTE DEUX GESTES QUE CE SCRIPT NE FERA PAS :
echo     1. fusionner %BRANCHE% dans main — sans cela aucune tache planifiee ne
echo        se declenche, donc la collecte des projets ne tournera jamais ;
echo     2. poser les trois secrets Cloudflare, sans lesquels il n'y a pas d'URL.
echo.
echo   ET UN AVERTISSEMENT : collecte.yml commite sur main chaque matin. Si tu
echo   actives la protection de branche sur main, EXCEPTE le robot d'Actions,
echo   sinon la collecte casse en silence.
echo.

:fin
echo.
echo   Journal complet : %JOURNAL%
timeout /t 30 >nul
endlocal
