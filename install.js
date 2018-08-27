const { existsSync, copySync, writeFileSync, removeSync, readFileSync } = require("fs-extra");
const { join } = require("path");
const { execSync } = require("child_process");
const { sync: pkgDir } = require("pkg-dir");
const Listr = require("listr");
const get = require("lodash/get");

const legacyArtefacts = ["tslint.json", "tsconfig.json", ".prettierrc"];
const removeLegacyArtefacts = packageRoot => {
  const removeArtefact = artefact => {
    const contextArtefactPath = join(packageRoot, artefact);
    const ourArtefactPath = join(__dirname, artefact);
    removeSync(contextArtefactPath);
    copySync(ourArtefactPath, contextArtefactPath);
    
    /**
      * Remove versioning of copied-over assets
      * since they're copied over postinstall, 
      * fail "silently" if they don't exist.
      */
    execSync(`git rm --cached ${contextArtefactPath} || echo "No cached artefacts to remove. Continuing…"`);
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
  const fileContents = [
    ...contents.split("\n").filter(line => !legacyArtefacts.includes(line)),
    ...legacyArtefacts,
  ].join("\n");

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

const addScripts = packageRoot => {
  const pathToPackageJson = join(packageRoot, "package.json");

  try {
    const packageJson = require(pathToPackageJson);
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Cover your eyes, functional friends – mutation time!
    if (!get(packageJson, "scripts.start", "").includes("operational-scripts")) {
      packageJson.scripts.start = "operational-scripts start";
    }
    if (!get(packageJson, "scripts.build", "").includes("operational-scripts")) {
      packageJson.scripts.build = "operational-scripts build";
    }

    packageJson.scripts.prepublishOnly = "operational-scripts prepare";
    packageJson.scripts.test = "operational-scripts test";
    delete packageJson.scripts.precommit;
    delete packageJson.jest;
    delete packageJson.test;
    delete packageJson.prettier;
    delete packageJson.lint;
    delete packageJson["lint-staged"];

    writeFileSync(pathToPackageJson, JSON.stringify(packageJson));
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
    writeFileSync(pathToPackageJson, JSON.stringify(packageJson));
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

    /**
     * Add this for a more create-react-app example,
     * maybe we'll need this later.
     */
    // {
    //   title: "Add sample app",
    //   task: addApp,
    // },
  ]);
  tasks.run(packageRoot);
} catch (e) {
  console.error(e);
}

/**
 *  This would give you a react app out of the
 * box, but let's not use it for now.
 */

// const addApp = (packageRoot, task) => {
//   if (pathExistsSync(join(packageRoot, "src"))) {
//     task.skip("`src` folder already exists");
//     return;
//   }
//   try {
//     copySync(join(__dirname, "assets/src"), join(packageRoot, "src"));
//   } catch (e) {
//     throw e;
//   }
// };
