const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const mwCore = path.resolve(projectRoot, '../../packages/mw-core');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [mwCore];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = config;
