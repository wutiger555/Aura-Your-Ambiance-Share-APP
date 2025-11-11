const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for Lottie animations
// Remove 'json' from sourceExts and add to assetExts
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'json');
config.resolver.assetExts = [...config.resolver.assetExts, 'json'];

module.exports = config;
