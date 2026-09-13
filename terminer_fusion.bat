@echo off
rem ============================================================================
rem  Repere - terminer la fusion, et DIRE ce qui se passe.
rem
rem  Le script precedent a fait l essentiel : rebase annule, travaux enregistres,
rem  main fusionne dans la branche en gardant la bonne version d App.jsx. Il s est
rem  arrete a l avance de main, sans que la raison soit visible d ici.
rem
rem  CE SCRIPT ECRIT TOUT DANS journal_fusion.txt, que Claude peut lire. Il ne
rem  force rien : s il ne peut pas avancer main sans fusion, il le dit et s arrete.
rem ============================================================================
cd /d "%~dp0"
set "J=%~dp0journal_fusion.txt"
> "%J%" echo ===== terminer_fusion %DATE% %TIME% =====

echo Diagnostic en cours, ecriture dans journal_fusion.txt...

>> "%J%" echo --- branche courante ---
git rev-parse --abbrev-ref HEAD >> "%J%" 2>&1
>> "%J%" echo --- etat du dossier ---
git status --porcelain >> "%J%" 2>&1
>> "%J%" echo --- main ---
git log --oneline -1 main >> "%J%" 2>&1
>> "%J%" echo --- branche de travail ---
git log --oneline -3 audit-finalisation-repere >> "%J%" 2>&1
>> "%J%" echo --- main est-il un ancetre de la branche ? ---
git merge-base --is-ancestor main audit-finalisation-repere
if errorlevel 1 (
  >> "%J%" echo NON : main a des commits que la branche n a pas.
  >> "%J%" echo --- ce que main a en plus ---
  git log --oneline audit-finalisation-repere..main >> "%J%" 2>&1
) else (
  >> "%J%" echo OUI : avance rapide possible.
)

>> "%J%" echo --- retour sur la branche de travail ---
git checkout audit-finalisation-repere >> "%J%" 2>&1
if errorlevel 1 goto :fin

>> "%J%" echo --- envoi de la branche ---
git push >> "%J%" 2>&1
if errorlevel 1 (
  >> "%J%" echo ECHEC push branche
  git push -u origin HEAD >> "%J%" 2>&1
)

>> "%J%" echo --- avance de main ---
git checkout main >> "%J%" 2>&1
git merge --ff-only audit-finalisation-repere >> "%J%" 2>&1
if errorlevel 1 (
  >> "%J%" echo ECHEC ff-only : main n a PAS ete avance. Rien de destructeur n a ete fait.
) else (
  git push >> "%J%" 2>&1
  if errorlevel 1 ( >> "%J%" echo ECHEC push main ) else ( >> "%J%" echo OK main pousse )
)

>> "%J%" echo --- retour sur la branche ---
git checkout audit-finalisation-repere >> "%J%" 2>&1

:fin
>> "%J%" echo --- etat final ---
git rev-parse --abbrev-ref HEAD >> "%J%" 2>&1
git log --oneline -1 >> "%J%" 2>&1
>> "%J%" echo ===== fin =====
echo.
echo Termine. Le detail est dans journal_fusion.txt — Claude va le lire.
timeout /t 15 >nul
exit /b 0
