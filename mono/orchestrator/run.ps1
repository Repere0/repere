$ErrorActionPreference = "Continue"

$ROOT = "C:\Users\APina\repere\mono"
$LOG  = "$ROOT\orchestrator\logs"

Set-Location $ROOT
New-Item -ItemType Directory -Force $LOG | Out-Null

function Header($text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

$prompt = @"
Projet Repère.

Objectif : rendre le projet viable pour un banc de test en décembre 2026.

Travaille de façon autonome.

Priorités :
1. architecture
2. données
3. code
4. UX/UI
5. qualité
6. tests
7. déploiement
8. performance
9. sécurité
10. préparation startup

Règles :
- inspecter avant de modifier ;
- mesurer avant de conclure ;
- préserver l'existant ;
- aucune modification destructive ;
- ne pas changer une architecture critique sans justification ;
- améliorer directement ce qui est sûr ;
- lancer les tests après modification ;
- documenter les changements.

Commence par les problèmes les plus importants et laisse le dépôt dans un état fonctionnel.
"@

# ========================================
# CODEX
# ========================================

Header "CODEX"

$codexLog = "$LOG\codex.log"

Write-Host "Lancement de Codex..."
Write-Host "Log : $codexLog"
Write-Host ""

cmd /c "codex.cmd exec --sandbox workspace-write -- `"$prompt`"" 2>&1 |
    Tee-Object -FilePath $codexLog

$codexExit = $LASTEXITCODE

if ($codexExit -eq 0) {
    Write-Host ""
    Write-Host "CODEX : OK" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "CODEX : ECHEC ($codexExit)" -ForegroundColor Red
}

# ========================================
# CLAUDE
# ========================================

Header "CLAUDE"

$claudeLog = "$LOG\claude.log"

Write-Host "Lancement de Claude..."
Write-Host "Log : $claudeLog"
Write-Host ""

cmd /c "claude.cmd -p `"$prompt`"" 2>&1 |
    Tee-Object -FilePath $claudeLog

$claudeExit = $LASTEXITCODE

if ($claudeExit -eq 0) {
    Write-Host ""
    Write-Host "CLAUDE : OK" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "CLAUDE : ECHEC ($claudeExit)" -ForegroundColor Red
}

# ========================================
# BUILD
# ========================================

Header "BUILD"

$buildLog = "$LOG\build.log"

Write-Host "Lancement du build..."
Write-Host ""

cmd /c "pnpm.cmd build" 2>&1 |
    Tee-Object -FilePath $buildLog

$buildExit = $LASTEXITCODE

if ($buildExit -eq 0) {
    Write-Host ""
    Write-Host "BUILD : OK" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "BUILD : ECHEC ($buildExit)" -ForegroundColor Red
}

# ========================================
# RESULTAT
# ========================================

Header "RESULTAT"

Write-Host ""
Write-Host "Codex  : $codexExit"
Write-Host "Claude : $claudeExit"
Write-Host "Build  : $buildExit"
Write-Host ""

Write-Host "Logs :"
Write-Host "  $codexLog"
Write-Host "  $claudeLog"
Write-Host "  $buildLog"
Write-Host ""

if ($codexExit -eq 0 -and $claudeExit -eq 0 -and $buildExit -eq 0) {
    Write-Host "TOUT EST OK." -ForegroundColor Green
    exit 0
}

Write-Host "ATTENTION : une ou plusieurs étapes ont échoué." -ForegroundColor Red
exit 1
