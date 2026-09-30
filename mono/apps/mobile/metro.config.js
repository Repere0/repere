/* L'application mobile vit HORS de l'espace de travail pnpm (voir
 * mono/pnpm-workspace.yaml) : Metro ne devine donc pas le monorepo. On lui
 * dit ou lire le code partage — packages/core et packages/data-utils, relies
 * par des liens `file:` — et rien d'autre. */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../../packages")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.unstable_enableSymlinks = true;
module.exports = config;
