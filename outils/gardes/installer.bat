@echo off
rem Branche les gardes de ce depot (voir outils/gardes/pre-commit).
cd /d "%~dp0..\.."
git config core.hooksPath outils/gardes
echo gardes branchees :
git config --get core.hooksPath
timeout /t 10 >nul
