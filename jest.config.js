const { join } = require("path");

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: join(__dirname, "tsconfig.jest.json"),
      diagnostics: false,
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))(?<!d)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
