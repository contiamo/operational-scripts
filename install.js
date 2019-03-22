const { existsSync, copySync, writeFileSync, removeSync, readFileSync } = require("fs-extra");
const { join } = require("path");
const { execSync } = require("child_process");
const { sync: pkgDir } = require("pkg-dir");
const Listr = require("listr");
const get = require("lodash/get");

const legacyArtefacts = [".eslintrc.js", "tsconfig.json", ".prettierrc"];
const removeLegacyArtefacts = packageRoot => {
  const removeArtefact = artefact => {
    const contextArtefactPath = join(packageRoot, artefact);
    const ourArtefactPath = join(__dirname, artefact);
    removeSync(contextArtefactPath);
    copySync(ourArtefactPath, contextArtefactPath);

    /**
     * Remove versioning of copied-over assets
     * since they're copied over postinstall,
     * fail silently if they don't exist.
     */
    try {
      execSync(`git rm --cached ${contextArtefactPath}`, {
        stdio: "ignore",
      });
    } catch (e) {
      // Here's the fail silently part.
    }
  };
  legacyArtefacts.forEach(removeArtefact);
};

const installPreCommit = (packageRoot, task) => {
  const dest = join(packageRoot, ".git/hooks/pre-commit");
  const src = join(__dirname, "./assets/pre-commit");
  try {
    copySync(src, dest);
  } catch (e) {
    task.skip("No git repository found. Skipping…");
  }
};

const installGitIgnore = (packageRoot, task) => {
  const gitignorePath = join(packageRoot, ".gitignore");
  const npmignorePath = join(__dirname, ".npmignore");

  const src = existsSync(gitignorePath) ? gitignorePath : npmignorePath;
  const contents = readFileSync(src, "utf8");
  const comment = "# Files managed by operational-scripts";
  const fileContents =
    [
      ...contents
        .trim()
        .split("\n")
        .filter(line => ![comment, ...legacyArtefacts].includes(line)),
      comment,
      ...legacyArtefacts,
    ].join("\n") + "\n";

  writeFileSync(gitignorePath, fileContents);
};

const installStaticFiles = (packageRoot, task) => {
  const dest = join(packageRoot, "public");
  if (existsSync(dest)) {
    task.skip("`public` folder already exists");
    return;
  }
  const src = join(__dirname, "assets/public");
  try {
    copySync(src, dest);
  } catch (e) {
    throw e;
  }
};

/**
 * Replace a script inside `package.json` if it doesn't contain the expected default script.
 * This ensures that users can add script snippets representing custom needs inside these scripts
 * without having their changes overridden on installation. If the default script is not contained, however,
 * it is inserted with everything else removed.
 * This method mutates the `packageJson` argument passed in.
 */
const addDefaultScripts = (scripts, packageJson) => {
  Object.entries(scripts).forEach(([scriptName, scriptContents]) => {
    if (!packageJson.scripts[scriptName]) {
      packageJson.scripts[scriptName] = scriptContents;
    }
  });
};

const addScripts = packageRoot => {
  const pathToPackageJson = join(packageRoot, "package.json");

  try {
    const packageJson = require(pathToPackageJson);
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    addDefaultScripts(
      {
        start: "operational-scripts start",
        build: "operational-scripts build",
        prepublishOnly: "operational-scripts prepare",
        test: "operational-scripts test",
      },
      packageJson,
    );
    packageJson.files = ["lib"];
    delete packageJson.scripts.precommit;
    delete packageJson.jest;
    delete packageJson.test;
    delete packageJson.prettier;
    delete packageJson.lint;
    delete packageJson["lint-staged"];

    writeFileSync(pathToPackageJson, JSON.stringify(packageJson, null, 2));
  } catch (e) {
    throw e;
  }
};

const addMain = (packageRoot, task) => {
  const pathToPackageJson = join(packageRoot, "package.json");
  try {
    const packageJson = require(pathToPackageJson);

    if (packageJson.main) {
      task.skip("Main file already defined. Skipping.");
      return;
    }
    packageJson.main = "./dist/main.js";
    writeFileSync(pathToPackageJson, JSON.stringify(packageJson, null, 2));
  } catch (e) {
    throw e;
  }
};

const formatFiles = packageRoot => {
  execSync(
    `${packageRoot}/node_modules/.bin/prettier ./**/*.{json,ts,tsx,js,jsx,md} --write --config ${join(
      __dirname,
      ".prettierrc",
    )}`,
  );
};

try {
  const packageRoot = pkgDir(join(__dirname, ".."));
  if (!packageRoot) {
    throw "Could not find the root of the current project.\nPlease make sure you have a package.json somewhere in this project.";
  }
  const tasks = new Listr([
    {
      title: "Replace legacy artefacts with symlinks",
      task: removeLegacyArtefacts,
    },
    {
      title: "Install precommit hook",
      task: installPreCommit,
    },
    {
      title: "Install/Update gitignore",
      task: installGitIgnore,
    },
    {
      title: "Install static files",
      task: installStaticFiles,
    },
    {
      title: "Add npm scripts",
      task: addScripts,
    },
    {
      title: 'Add "main" file',
      task: addMain,
    },
    {
      title: "Reformat code in project",
      task: formatFiles,
    },
  ]);
  tasks.run(packageRoot);
} catch (e) {
  console.error(e);
}

// Methods exported for tests
module.exports = {
  addDefaultScripts,
};
