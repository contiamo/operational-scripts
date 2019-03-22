#!/usr/bin/env node
const { execSync, exec } = require("child_process");
const { join } = require("path");
const { sync: pkgDir } = require("pkg-dir");
const { createCertificate } = require("pem");
const { removeSync, readFileSync } = require("fs-extra");
const { existsSync } = require("fs");
const parseYargs = require("yargs-parser");
const Listr = require("listr");
const serve = require("webpack-dev-server");

const history = require("connect-history-api-fallback");
const convert = require("koa-connect");

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

  case "lint-ts":
    properExec("eslint", ["--fix", "--max-warnings=0", "-c", join(__dirname, ".eslintrc.js")]);
    break;

  case "start":
    properExec("webpack-dev-server", ["--config", join(__dirname, "webpack.config.js")]);
    break;

  case "build":
    build();
    break;

  case "test":
    properExec("jest", ["--config", join(__dirname, "jest.config.js"), "--rootDir", [context]]);
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

  default:
    throw `Cannot find script ${script}. Please try again or ask for help.`;
}

/** Maybe later if we want to add a check-ts script */

// case "check-ts":
//   const tsconfig = require(join(__dirname, "tsconfig.json")) || {};
//   const tscFlags = Object.entries(tsconfig.compilerOptions)
//     .filter(([optionFlag]) => !optionFlag.match(RegExp("dir", "i")))
//     .map(([optionKey, optionValue]) => {
//       const optionFlag = `--${optionKey}`;
//       if (optionValue === true) {
//         return optionFlag;
//       }
//       if (optionValue instanceof Array) {
//         return `${optionFlag} ${optionValue.join(",")}`;
//       }
//       return `${optionFlag} ${optionValue}`;
//     });

//   properExec("tsc", [...tscFlags, "--noEmit"]);
//   break;
