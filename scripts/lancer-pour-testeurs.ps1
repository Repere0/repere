# Lance Expo en mode tunnel pour testeurs distants (Windows, PowerShell).
# Usage : clic droit > Executer avec PowerShell, ou depuis un terminal :
#   powershell -ExecutionPolicy Bypass -File scripts\lancer-pour-testeurs.ps1
# L'ordinateur doit rester allume et connecte tant que les testeurs utilisent l'application.
# Premier lancement : Expo peut demander d'installer @expo/ngrok (le tunnel). Repondre oui.
# Non execute dans la session qui l'a ecrit (pas de PowerShell) : a essayer une fois avant l'envoi.
Write-Host "=== Lancement Expo pour testeurs ===" -ForegroundColor Cyan
Write-Host "Prérequis : Expo Go installé sur le téléphone du testeur" -ForegroundColor Yellow
Write-Host ""
Set-Location "$PSScriptRoot\..\mono\apps\mobile"
# Verification du contact (docs/checklist-distribution.md, etape 1) : sans lui, l'ecran
# « A propos » n'affiche aucun contact. Ne bloque pas le lancement.
if (-not (Test-Path ".env") -or -not (Select-String -Path ".env" -Pattern '^EXPO_PUBLIC_CONTACT_EMAIL=.+' -Quiet)) {
  Write-Host "Attention : EXPO_PUBLIC_CONTACT_EMAIL absent de mono\apps\mobile\.env (modele : .env.example)." -ForegroundColor Red
}
# --clear : vide le cache de Metro, pour que les variables du .env soient bien relues.
npx.cmd expo start --tunnel --clear
