// Babel config for the testing env (jest)
module.exports = {
  presets: ["@babel/preset-typescript", "@babel/preset-react", ["@babel/preset-env", { targets: { node: "current" } }]],
};
