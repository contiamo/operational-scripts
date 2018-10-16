const installMethods = require("../install.js");

describe("replaceScripts", () => {
  it("replaces scripts", () => {
    const packageJson = {
      scripts: {
        // This is left intact because it already contains the specified default script
        start: "startScript && echo 'hello'",
        // The `build` script is added since it doesn't exist
        // The `test` script is replaced since it doesn't contain the specified default script
        test: "wrongTestScript"
      },
    };
    installMethods.replaceScripts(
      {
        start: "startScript",
        build: "buildScript",
        test: "testScript",
      },
      packageJson,
    );
    expect(packageJson).toEqual({
      scripts: {
        start: "startScript && echo 'hello'",
        build: "buildScript",
        test: "testScript"
      },
    });
  });
});
