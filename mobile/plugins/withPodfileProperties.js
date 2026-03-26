const { withPodfileProperties } = require("expo/config-plugins");

module.exports = function withPodfilePropertiesPlugin(config) {
  return withPodfileProperties(config, (config) => {
    config.modResults = config.modResults ?? {};
    config.modResults["newArchEnabled"] = "true";
    config.modResults["ios.buildReactNativeFromSource"] = "true";
    return config;
  });
};
