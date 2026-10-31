/* L'application mobile vit HORS de l'espace de travail pnpm (voir
 * mono/pnpm-workspace.yaml) : Metro ne devine donc pas le monorepo. On lui
 * dit ou lire le code partage — packages/core et packages/data-utils, relies
 * par des liens `file:` — et rien d'autre. */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// data/contenu : fiches de l'écran de prévisualisation dev (dev-impact.tsx), à la racine du dépôt.
config.watchFolders = [path.resolve(__dirname, "../../packages"), path.resolve(__dirname, "../../../data/contenu")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.unstable_enableSymlinks = true;
module.exports = config;
