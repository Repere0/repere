@echo off
rem ============================================================================
rem  Repere - envoie au depot ce qui a change, sans rien te demander.
rem
rem  POURQUOI CE FICHIER : Claude ecrit dans ce dossier mais n a aucun shell sur
rem  cette machine, il ne peut donc pas lancer git. Ce script etait la derniere
rem  chose a faire a la main a chaque changement. Double-clic, ou tache planifiee
rem  horaire (voir installer_tache_horaire.bat), et il n y a plus rien a faire.
rem
rem  CE QUI PROTEGE : pousser ne publie rien par soi-meme. Le workflow reconstruit
rem  le site, l EPROUVE avec les 40 controles du banc dans un vrai navigateur, et
rem  ne publie que si tout passe. Un fichier casse ne peut donc pas atteindre le
rem  site. Ici, on refuse en plus tout fichier dont le nom evoque un secret, et
rem  tout fichier de plus de 50 Mo.
rem ============================================================================
cd /d "%~dp0"
set "JOURNAL=%~dp0journal_pousser.txt"
echo.>> "%JOURNAL%"
echo ===== %DATE% %TIME% =====>> "%JOURNAL%"

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
