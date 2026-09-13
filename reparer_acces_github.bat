@echo off
rem ============================================================================
rem  Repere - reparer l acces en ecriture a GitHub. A lancer UNE FOIS.
rem
rem  LE DIAGNOSTIC, releve dans journal_pousser.txt le 13/09/2026 a 3h38 :
rem
rem    remote: Permission to Repere0/repere.git denied to Repere0.
rem    fatal: ... The requested URL returned error: 403
rem
rem  Le commit est bien fait sur ta machine ; c est l ENVOI que GitHub refuse.
rem  Le compte est le bon, donc le jeton enregistre dans Windows est expire,
rem  revoque, ou n a pas le droit « Contents: Read and write » sur ce depot.
rem  C est la vraie raison pour laquelle rien n est parti depuis le 26 aout ;
rem  le « RIEN A ENVOYER » du journal ne faisait que la cacher.
rem
rem  CE QUE FAIT CE SCRIPT : il enregistre un nouveau jeton dans le gestionnaire
rem  d identifiants de Windows, puis retente l envoi. Le jeton ne s ecrit nulle
rem  part dans le depot, et le fichier temporaire est efface juste apres.
rem
rem  AVANT DE LE LANCER, cree le jeton :
rem    github.com -> photo de profil -> Settings -> Developer settings
rem    -> Personal access tokens -> Tokens (classic) -> Generate new token
rem    -> coche la case « repo » -> Generate -> copie la valeur (ghp_...)
rem  Elle ne sera plus reaffichee ensuite. Ne la colle dans aucune conversation.
rem ============================================================================
cd /d "%~dp0"
setlocal

echo.
echo   Reparation de l acces en ecriture a github.com/Repere0/repere
echo   -------------------------------------------------------------
echo.
set "JETON="
set /p JETON=Colle ici ton jeton GitHub puis Entree : 
if "%JETON%"=="" (
  echo Aucun jeton saisi. Rien n a ete change.
  timeout /t 8 >nul
  exit /b 1
)

rem « git credential approve » passe par le gestionnaire configure sous Windows :
rem on n ecrit donc aucun mot de passe en clair dans .git/config.
> "%TEMP%\repere_cred.txt" echo protocol=https
>> "%TEMP%\repere_cred.txt" echo host=github.com
>> "%TEMP%\repere_cred.txt" echo username=Repere0
>> "%TEMP%\repere_cred.txt" echo password=%JETON%
git credential approve < "%TEMP%\repere_cred.txt"
del "%TEMP%\repere_cred.txt" 2>nul
set "JETON="

echo.
echo   Envoi de la branche...
git push -u origin HEAD
if errorlevel 1 (
  echo.
  echo   ECHEC. Deux causes possibles, dans cet ordre :
  echo     1. le jeton n a pas la permission « repo » ^(ou « Contents: Read and write »^)
  echo     2. le jeton appartient a un compte qui n est pas proprietaire du depot
  echo   Regenere un jeton classique avec la case « repo » cochee, et relance.
  timeout /t 30 >nul
  exit /b 1
)
echo.
echo   OK. La branche est sur GitHub, et la tache horaire reprendra toute seule.
echo   Verifie : https://github.com/Repere0/repere/branches
timeout /t 20 >nul
exit /b 0
