@echo off
rem Installe une tache horaire qui lance pousser.bat. A executer UNE seule fois.
rem Aucun droit administrateur necessaire : la tache appartient a ton compte.
schtasks /Create /SC HOURLY /TN "Repere - pousser" /TR "\"%~dp0pousser.bat\"" /F
if errorlevel 1 (
  echo ECHEC de la creation. Envoie ce message a Claude.
) else (
  echo Tache creee : elle tournera toutes les heures.
  echo Pour la retirer : desinstaller_tache.bat
)
pause
