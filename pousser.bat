@echo off
rem ============================================================================
rem  Repere - envoie au depot ce qui a change, sans rien te demander.
rem
rem  VERSION 2 (20/08/2026). Ce que la version 1 avait rate :
rem  le journal etait ecrit DANS le depot et suivi par git. Au moment du rebase,
rem  git tentait de remplacer un fichier que ce script tenait ouvert, echouait avec
rem  ® unable to unlink old ¯, et laissait derriere lui une reference MERGE_AUTOSTASH
rem  qui bloquait toutes les tentatives suivantes. Deux corrections : le journal est
rem  desormais ignore par git, et une reference d autostash restee coincee est
rem  effacee au demarrage. Une panne qui se repare toute seule au lancement suivant
rem  vaut mieux qu une panne qui exige un humain.
rem ============================================================================
cd /d "%~dp0"
set "JOURNAL=%~dp0journal_pousser.txt"
echo.>> "%JOURNAL%"
echo ===== %DATE% %TIME% =====>> "%JOURNAL%"

rem Nettoyage prealable : reste d une execution interrompue. 2>nul car l absence
rem de la reference est le cas NORMAL, pas une erreur.
git update-ref -d MERGE_AUTOSTASH 2>nul

echo [1/4] Recuperation des commits du robot...
git pull --rebase --autostash origin main >> "%JOURNAL%" 2>&1
if errorlevel 1 (
  echo ECHEC : la recuperation a echoue. Rien n a ete envoye.
  echo Ouvre journal_pousser.txt et envoie les dernieres lignes a Claude.
  echo ECHEC pull>> "%JOURNAL%"
  pause
  exit /b 1
)

echo [2/4] Preparation des changements...
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo Rien de nouveau a envoyer.
  echo RIEN A ENVOYER>> "%JOURNAL%"
  exit /b 0
)

echo [3/4] Controle : aucun fichier ne doit ressembler a un secret...
git diff --cached --name-only > "%TEMP%\repere_staged.txt"
findstr /I /C:".env" /C:"secret" /C:"token" /C:"credential" /C:".pem" /C:"id_rsa" "%TEMP%\repere_staged.txt" >nul
if not errorlevel 1 (
  echo REFUS : un fichier au nom suspect allait partir. Rien n a ete fait.
  type "%TEMP%\repere_staged.txt"
  echo REFUS secret>> "%JOURNAL%"
  git reset >nul
  pause
  exit /b 1
)
for /f "usebackq delims=" %%F in ("%TEMP%\repere_staged.txt") do (
  if exist "%%F" (
    if %%~zF GTR 52428800 (
      echo REFUS : %%F depasse 50 Mo. Rien n a ete fait.
      echo REFUS taille %%F>> "%JOURNAL%"
      git reset >nul
      pause
      exit /b 1
    )
  )
)

echo [4/4] Envoi...
git commit -m "Depot automatique du %DATE% %TIME%" >> "%JOURNAL%" 2>&1
git push >> "%JOURNAL%" 2>&1
if errorlevel 1 (
  echo ECHEC : l envoi a echoue. Le commit est fait, mais rien n est parti.
  echo ECHEC push>> "%JOURNAL%"
  pause
  exit /b 1
)
echo OK - envoye. Le workflow prend le relais.
echo OK>> "%JOURNAL%"
exit /b 0
