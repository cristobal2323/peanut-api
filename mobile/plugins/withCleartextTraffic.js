const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest?.manifest?.application?.[0];
    if (!application) {
      return config;
    }
    application.$ = application.$ ?? {};
    application.$["android:usesCleartextTraffic"] = "true";
    return config;
  });
};
