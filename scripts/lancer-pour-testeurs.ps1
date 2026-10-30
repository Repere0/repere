# Lance Expo en mode tunnel pour testeurs distants (Windows, PowerShell).
# Usage : clic droit > Executer avec PowerShell, ou depuis un terminal :
#   powershell -ExecutionPolicy Bypass -File scripts\lancer-pour-testeurs.ps1
# L'ordinateur doit rester allume et connecte tant que les testeurs utilisent l'application.
# Premier lancement : Expo peut demander d'installer @expo/ngrok (le tunnel). Repondre oui.
Write-Host "=== Lancement Expo pour testeurs ===" -ForegroundColor Cyan
Write-Host "Prérequis : Expo Go installé sur le téléphone du testeur" -ForegroundColor Yellow
Write-Host ""
Set-Location "$PSScriptRoot\..\mono\apps\mobile"
npx.cmd expo start --tunnel
