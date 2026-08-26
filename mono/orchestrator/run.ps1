$ErrorActionPreference = "Continue"

$ROOT = "C:\Users\APina\repere\mono"
$LOG = "$ROOT\orchestrator\logs"

Set-Location $ROOT
New-Item -ItemType Directory -Force $LOG | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " REPERÉ - ORCHESTRATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Projet : $ROOT"
Write-Host ""

$prompt = @"
Tu travailles sur le projet Repère.

Objectif :
rendre Repère viable pour un banc de test en décembre 2026.

Inspecte le dépôt avant toute modification.

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
- mesure avant de conclure ;
- préserve l'existant ;
- ne fais aucune modification destructive ;
- ne change pas l'architecture critique sans justification ;
- les décisions critiques doivent être signalées ;
- améliore directement ce qui est sûr et local ;
- lance les tests après modification ;
- documente les changements.

Travaille de façon autonome sur les problèmes prioritaires.
"@

# --------------------------------------------------
# CODEX
# --------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CODEX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$codexLog = "$LOG\codex.log"

& codex.cmd exec --sandbox workspace-write $prompt 2>&1 |
    Out-File -FilePath $codexLog -Encoding utf8

$codexExit = $LASTEXITCODE

Write-Host ""
if ($codexExit -eq 0) {
    Write-Host "CODEX : OK" -ForegroundColor Green
} else {
    Write-Host "CODEX : ECHEC ($codexExit)" -ForegroundColor Red
    Write-Host "Log : $codexLog"
}

# --------------------------------------------------
# CLAUDE
# --------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CLAUDE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$claudeLog = "$LOG\claude.log"

& claude.cmd -p $prompt 2>&1 |
    Out-File -FilePath $claudeLog -Encoding utf8

$claudeExit = $LASTEXITCODE

Write-Host ""
if ($claudeExit -eq 0) {
    Write-Host "CLAUDE : OK" -ForegroundColor Green
} else {
    Write-Host "CLAUDE : ECHEC ($claudeExit)" -ForegroundColor Red
    Write-Host "Log : $claudeLog"
}

# --------------------------------------------------
# BUILD
# --------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$buildLog = "$LOG\build.log"

pnpm.cmd build 2>&1 |
    Out-File -FilePath $buildLog -Encoding utf8

$buildExit = $LASTEXITCODE

Write-Host ""
if ($buildExit -eq 0) {
    Write-Host "BUILD : OK" -ForegroundColor Green
} else {
    Write-Host "BUILD : ECHEC ($buildExit)" -ForegroundColor Red
}

# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Logs :" -ForegroundColor Yellow
Write-Host "  $codexLog"
Write-Host "  $claudeLog"
Write-Host "  $buildLog"

Write-Host ""

if ($codexExit -eq 0 -and $claudeExit -eq 0 -and $buildExit -eq 0) {
    Write-Host "TOUT EST OK." -ForegroundColor Green
} else {
    Write-Host "ATTENTION : au moins une étape a échoué." -ForegroundColor Red
}

Write-Host ""