const installMethods = require("../install.js");

describe("addDefaultScripts", () => {
  it("replaces scripts", () => {
    const packageJson = {
      scripts: {
        // This is left intact because it is already set
        start: "startScript && echo 'hello'",
        // The `build` script is added since it doesn't exist
        // The `test` script is replaced since it is falsy
        test: "",
      },
    };
    installMethods.addDefaultScripts(
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
        test: "testScript",
      },
    });
  });
});
