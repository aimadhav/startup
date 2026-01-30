const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Attempt to resolve the path explicitly to avoid protocol errors
const inputPath = path.join(__dirname, "src", "global.css");

module.exports = withNativeWind(config, { input: inputPath });
