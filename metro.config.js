// @ts-check
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for SDK 54 - disable package exports enforcement
config.resolver.unstable_enablePackageExports = false;

// Asegurar que los módulos se resuelvan correctamente
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json'];

module.exports = config;
