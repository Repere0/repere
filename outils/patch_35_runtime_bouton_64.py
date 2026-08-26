"""Copie les donnees departementales dans dist et garde le choix disponible.

Sans data/ dans la sortie Vite, l'index des departements repond 404 et aucun
bouton de departement, dont 64, n'est rendu dans le navigateur.
"""
from pathlib import Path


def remplacer(fichier, ancien, nouveau):
    texte = fichier.read_text(encoding="utf-8")
    assert texte.count(ancien) == 1, f"ancre absente ou multiple : {fichier}"
    assert nouveau not in texte, f"patch deja applique : {fichier}"
    fichier.write_text(texte.replace(ancien, nouveau), encoding="utf-8")
    relu = fichier.read_text(encoding="utf-8")
    assert relu.count(nouveau) == 1, f"ecriture non verifiee : {fichier}"


RACINE = Path(__file__).resolve().parents[1]
remplacer(
    RACINE / "mono/apps/web/package.json",
    '"build": "vite build && node ../../scripts/empreinte-sw.mjs dist",',
    '"build": "vite build && xcopy /E /I /Y ..\\\\..\\\\data dist\\\\data > nul && node ../../scripts/empreinte-sw.mjs dist",',
)
remplacer(
    RACINE / "mono/apps/web/src/App.jsx",
    '<details className="choix" open={!departement}>',
    '<details className="choix" open>',
)
remplacer(
    RACINE / "mono/package.json",
    '"test": "node --test tests/",',
    '"test": "node --test tests/*.test.mjs",',
)
