module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "react-app",
    "plugin:jsx-a11y/recommended",
    // "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    // "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
  ],
  plugins: ["jsx-a11y"],
  // parserOptions: {
  //   ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
  //   sourceType: "module", // Allows for the use of imports
  //   ecmaFeatures: {
  //     jsx: true, // Allows for the parsing of JSX
  //   },
  // },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    // "@typescript-eslint/no-var-requires": false,
    // "@typescript-eslint/camelcase": false,
  },
};
