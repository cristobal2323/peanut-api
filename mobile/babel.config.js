module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated 4.x: el plugin se movió a react-native-worklets.
    // Debe ir SIEMPRE al final de la lista.
    plugins: ["react-native-worklets/plugin"]
  };
};
