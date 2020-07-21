#!/usr/bin/env node
const { execSync, exec } = require("child_process");
const { join } = require("path");
const { sync: pkgDir } = require("pkg-dir");
const { removeSync, readFileSync } = require("fs-extra");
const { existsSync } = require("fs");
const parseYargs = require("yargs-parser");
const Listr = require("listr");

const install = require("./install");

const [path, thisScript, script, ...forwardedArgs] = process.argv;
const context = pkgDir(process.cwd());

const localScript = scriptName => join(context, `./node_modules/.bin/${scriptName}`);

const properExec = (script, extraArgs = []) => {
  try {
    if (!script) {
      throw "No script specified. 🤔";
    }
    return execSync(`${localScript(script)} ${[...extraArgs, ...forwardedArgs].join(" ")}`, {
      stdio: "inherit",
    });
  } catch (e) {
    // No output because stdio is shared.
    process.exit(1);
  }
};

const build = extraArgs => {
  const args = { ...parseYargs(forwardedArgs), ...extraArgs };
  const tasks = new Listr(
    [
      {
        title: "Building for Production...",
        task: (taskContext, task) =>
          !taskContext.for || taskContext.for === "production"
            ? new Promise((resolve, reject) => {
                removeSync(join(context, "dist"));
                exec(`webpack -p --config ${join(__dirname, "webpack.config.js")}`, (err, stdout) => {
                  if (err) {
                    reject({ error: stdout });
                    return;
                  }
                  resolve("Production build ready");
                });
              })
            : task.skip("Skipping production build"),
      },
      {
        title: "Packaging for npm...",
        task: (taskContext, task) =>
          !taskContext.for || taskContext.for === "npm"
            ? new Promise((resolve, reject) => {
                removeSync(join(context, "lib"));
                exec("tsc", { stdio: "ignore" }, (err, stdout) => {
                  if (err) {
                    reject({ error: stdout });
                    return;
                  }
                  resolve("npm package ready");
                });
              })
            : task.skip("Skipping npm package"),
      },
    ],
    {
      concurrent: true,
    },
  );

  return tasks.run(args).catch(err => {
    console.error(err);
    process.exit(1);
  });
};

switch (script) {
  case "precommit":
    properExec("lint-staged", ["-c", join(__dirname, ".lintstagedrc")]);
    break;

  case "prettify":
    properExec("prettier", ["--write", "--config", join(__dirname, ".prettierrc")]);
    break;

  case "toc":
    properExec("doctoc");
    break;

  case "eslint":
    properExec("eslint", ["--fix", "-c", join(__dirname, ".eslintrc.js")]);
    break;

  case "start":
    properExec("webpack-dev-server", ["--config", join(__dirname, "webpack.config.js")]);
    break;

  case "build":
    build();
    break;

  case "test":
    properExec("jest", ["--rootDir", [context]]);
    break;

  case "prepare":
    const packageJson = readFileSync(join(context, "package.json"), "utf8");
    const mainFile = JSON.parse(packageJson).main;
    build({ for: "npm" })
      .then(() => {
        if (!existsSync(join(context, mainFile))) {
          throw `
Error: Your "main" file in package.json doesn't exist.
Please adjust it and try again.
`;
        }
      })
      .catch(error => {
        console.error(error);
        process.exit(1);
      });

    break;

  case "install":
    install.run();
    break;

  default:
    throw `Cannot find script ${script}. Please try again or ask for help.`;
}
