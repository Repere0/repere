@echo off
rem ============================================================================
rem  Repere - envoie au depot ce qui a change, sans rien te demander.
rem
rem  VERSION 3 (26/08/2026) - voir le bloc de l etape 3.
rem  VERSION 2 (20/08/2026). Ce que la version 1 avait rate :
rem  le journal etait ecrit DANS le depot et suivi par git. Au moment du rebase,
rem  git tentait de remplacer un fichier que ce script tenait ouvert, echouait avec
rem  ï¿½ unable to unlink old ï¿½, et laissait derriere lui une reference MERGE_AUTOSTASH
rem  qui bloquait toutes les tentatives suivantes. Deux corrections : le journal est
rem  desormais ignore par git, et une reference d autostash restee coincee est
rem  effacee au demarrage. Une panne qui se repare toute seule au lancement suivant
rem  vaut mieux qu une panne qui exige un humain.
rem ============================================================================
cd /d "%~dp0"
if /I "%~1"=="--test" goto :autotest
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
  timeout /t 15 >nul
  exit /b 1
)

echo [2/4] Preparation des changements...
rem ---------------------------------------------------------------------------
rem VERSION 5 (13/09/2026). LA VERSION 4 MENTAIT.
rem Mesure : le journal dit RIEN A ENVOYER a chaque execution horaire depuis le
rem 26 aout, et pourtant github.com/Repere0/repere n a jamais recu la branche
rem audit-finalisation-repere. Cause exacte : le test « git diff --cached
rem --quiet » repond « rien de nouveau A COMMITTER », et le script sortait la
rem dessus en succes SANS JAMAIS REGARDER si des commits deja faits restaient a
rem quai. Trois semaines de travail sont restees sur un seul disque.
rem
rem Correctif : le chemin passe desormais TOUJOURS par :envoyer. Rien a
rem committer ne veut pas dire rien a envoyer.
rem ---------------------------------------------------------------------------
git add -A
git diff --cached --quiet
if errorlevel 1 goto :il_y_a_du_neuf
echo Rien de nouveau a committer.
echo RIEN A COMMITTER>> "%JOURNAL%"
goto :envoyer
:il_y_a_du_neuf

echo [3/4] Controle : aucun fichier ne doit ressembler a un secret...
git diff --cached --name-only > "%TEMP%\repere_staged.txt"

rem ---------------------------------------------------------------------------
rem VERSION 4 (26/08/2026, apres-midi). LA VERSION 3 N A PAS MARCHE.
rem Elle filtrait les extensions avec Â« findstr /V /E Â» sur la liste entiere.
rem Mesure : le refus est retombe sur mono/packages/ui/src/tokens.css, donc le
rem filtre n a rien exclu. La cause probable est le comportement de findstr sur
rem un fichier dont les lignes se terminent par LF seul â€” ce que git ecrit.
rem
rem VERSION 4 : plus aucune dependance a ce comportement. On lit la liste ligne
rem par ligne, et on teste L EXTENSION SEULE avec Â« findstr /X Â», qui compare la
rem ligne entiere. Un fichier de code, de style ou de balisage ne peut pas etre
rem un secret : il sort du controle. Tout le reste â€” .env, .pem, .txt, .json, un
rem fichier sans extension â€” y reste soumis.
rem
rem POUR VERIFIER CETTE LOGIQUE SANS RIEN ENVOYER : pousser.bat --test
rem ---------------------------------------------------------------------------
del "%TEMP%\repere_a_controler.txt" 2>nul
del "%TEMP%\repere_suspects.txt" 2>nul
for /f "usebackq delims=" %%F in ("%TEMP%\repere_staged.txt") do (
  echo(%%~xF| findstr /I /X /C:".css" /C:".js" /C:".jsx" /C:".mjs" /C:".ts" /C:".tsx" /C:".html" /C:".md" /C:".py" /C:".map" /C:".bat" >nul || echo(%%F>> "%TEMP%\repere_a_controler.txt"
)
rem Ecrit a plat, avec des goto plutot que des blocs imbriques : dans un bloc
rem entre parentheses, une erreur de lecture d errorlevel est invisible et se
rem traduirait par un controle qui ne controle plus rien.
if not exist "%TEMP%\repere_a_controler.txt" goto :aucun_suspect
findstr /I /C:".env" /C:"secret" /C:"token" /C:"credential" /C:".pem" /C:"id_rsa" "%TEMP%\repere_a_controler.txt" > "%TEMP%\repere_suspects.txt"
if errorlevel 1 goto :aucun_suspect
echo REFUS : un fichier au nom suspect allait partir. Rien n a ete fait.
echo Le ou les fichiers en cause :
type "%TEMP%\repere_suspects.txt"
echo REFUS secret>> "%JOURNAL%"
type "%TEMP%\repere_suspects.txt">> "%JOURNAL%"
git reset >nul
timeout /t 15 >nul
exit /b 1
:aucun_suspect

for /f "usebackq delims=" %%F in ("%TEMP%\repere_staged.txt") do (
  if exist "%%F" (
    if %%~zF GTR 52428800 (
      echo REFUS : %%F depasse 50 Mo. Rien n a ete fait.
      echo REFUS taille %%F>> "%JOURNAL%"
      git reset >nul
      timeout /t 15 >nul
      exit /b 1
    )
  )
)

echo [4/4] Envoi...
git commit -m "Depot automatique du %DATE% %TIME%" >> "%JOURNAL%" 2>&1

:envoyer
rem Une branche sans amont refuse « git push » tout court. On regarde d abord,
rem on choisit ensuite. Le cas normal est le premier ; le second ne se produit
rem qu au tout premier envoi d une branche.
git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
if errorlevel 1 goto :premier_envoi
git push >> "%JOURNAL%" 2>&1
if errorlevel 1 goto :echec_push
goto :envoi_ok
:premier_envoi
echo Cette branche n avait pas d amont : creation sur origin.
echo PREMIER ENVOI (push -u)>> "%JOURNAL%"
git push -u origin HEAD >> "%JOURNAL%" 2>&1
if errorlevel 1 goto :echec_push
:envoi_ok
echo OK - envoye. Le workflow prend le relais.
echo OK>> "%JOURNAL%"
exit /b 0
:echec_push
echo ECHEC : l envoi a echoue. Le commit local est fait, mais rien n est parti.
echo ECHEC push>> "%JOURNAL%"
exit /b 1

rem ===========================================================================
rem  AUTOTEST â€” verifie le filtre du controle des secrets, sans toucher a git.
rem  Lance : pousser.bat --test
rem  Attendu : les cinq premieres lignes DOIVENT etre suspectes, les cinq
rem  suivantes NE DOIVENT PAS l etre. Si ce n est pas le cas, ne pousse pas et
rem  envoie la sortie a Claude.
rem ===========================================================================
:autotest
echo Autotest du controle des secrets.
echo.
(
  echo mono/.env
  echo outils/token.txt
  echo cles/id_rsa
  echo certif/site.pem
  echo docs/secret.json
  echo mono/packages/ui/src/tokens.css
  echo mono/scripts/extract-html.js
  echo outils/patch_37_legende.py
  echo docs/tuto_monorepo.html
  echo CONTEXTE_PROJET.md
) > "%TEMP%\repere_test_in.txt"
del "%TEMP%\repere_test_ctrl.txt" 2>nul
for /f "usebackq delims=" %%F in ("%TEMP%\repere_test_in.txt") do (
  echo(%%~xF| findstr /I /X /C:".css" /C:".js" /C:".jsx" /C:".mjs" /C:".ts" /C:".tsx" /C:".html" /C:".md" /C:".py" /C:".map" /C:".bat" >nul || echo(%%F>> "%TEMP%\repere_test_ctrl.txt"
)
echo --- DOIVENT etre signales (5 attendus) ---
findstr /I /C:".env" /C:"secret" /C:"token" /C:"credential" /C:".pem" /C:"id_rsa" "%TEMP%\repere_test_ctrl.txt"
echo.
echo --- NE DOIVENT PAS apparaitre au-dessus ---
echo   mono/packages/ui/src/tokens.css
echo   mono/scripts/extract-html.js
echo   outils/patch_37_legende.py
echo   docs/tuto_monorepo.html
echo   CONTEXTE_PROJET.md
echo.
pause
exit /b 0
