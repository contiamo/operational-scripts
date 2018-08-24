const { join } = require("path");

module.exports = {
  globals: {
    "ts-jest": {
      tsConfigFile: join(__dirname, "tsconfig.jest.json"),
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))(?<!d)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
