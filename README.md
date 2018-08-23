# Operational Scripts

> One toolchain to rule them all

At Contiamo, we deal with a number of different UI projects. Each project begins as a [greenfield project](https://en.wikipedia.org/wiki/Greenfield_project) and is configured to handle things like [code style settings](https://prettier.io/docs/en/configuration.html), [linting](https://palantir.github.io/tslint/), [precommit hooks on git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks), _et cetera_. The project then grows organically, while the configuration options go through a number of tweaks.

The end result is an array of codebases that are configured differently and lack some type of general consistency, homogeny or _glue_. Instead, we'd like each project to be consistent in order to allow each member on our team to be able to immediately read and understand the codebase, while abstracting away the complexity of maintaining build configurations, dev servers, linters, and other things.

While this is no silver bullet to end all onboarding and scalable maintainability, it is an attempt to remedy the problem in a way that is **[TypeScript](https://github.com/Microsoft/TypeScript/) first:** Operational Scripts allows us to hit the ground running with TypeScript with all of the tooling around it, including webpack packaging and development servers taken care of, including TSLint with optimal settings.

Ideally, everything _just works_ so long as we have a reasonable project structure<sup>[[1]](#footnotes)</sup>.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

* [Getting Started](#getting-started)
* [Nuances](#nuances)
  * [Build Script](#build-script)
  * [Webpack Configuration](#webpack-configuration)
* [Contributing](#contributing)
* [Footnotes](#footnotes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting Started

* `npm install @operational/scripts -D`

Running this command will:

* Replace any `tsconfig.json`, `tslint.json` and `.prettierrc` in your current project with our configuration.

- Install a precommit hook that, before commit:
  * Adds a table of contents to Markdown
  * Lints TypeScript
  * Pretty prints everything it can process
- Updates your `.gitignore` to include some more files, or adds one if missing
- Adds a `public` folder with a HTML template and a configuration file<sup>[[2]](#footnotes)</sup>.
- Adds/updates your package's `start`, `build` `prepublishOnly`, and `test` scripts to:
  * `start`: runs [`webpack-serve`](https://github.com/webpack-contrib/webpack-serve) with any extra configuration passed in as flags.
  * `build`: see [Build Script](#build-script).
  * `test`: runs [Jest](https://github.com/facebook/jest) with.
  * `prePublishOnly`: checks if the `"main"` file in your `package.json` actually exists before npm publish.
- Update your package's `main` file. (See [Build Script](#build-script))
  * Our [predefined webpack configuration](#webpack-configuration) sets an output file path. We mirror this path in your package's `main` file.

## Nuances

Operational Scripts required making some interesting decisions about configuration. These are outlined here for transparency.

### Build Script

At Contaimo, we build web applications that run standalone, _and_ compose into a suite of web applications that is our final product. In order to create these embeddable applications, we need a two-step build process:

1. **Build for production and deployment:** just a standalone, `webpack -p` web app.
2. **Build for Contiamo UI:** this packages the app and prepares it to be published to our internal `npm` registry, or the public `npm` registry if open source.

Running `npm build` in a package that uses Operational Scripts will run both steps in parallel. If your use case only requires one or the other, simply use the `--for` flag, specifying the target of the build: `production` or `npm`.

`npm run build -- --for npm`, or `npm run build -- --for production` will build just what you need.

### Webpack Configuration

We still want to be flexible with Operational Scripts because our projects evolve, and _as they evolve_, we may need to extend the webpack configuration in certain ways: perhaps we need more granular control over the dev server? What if we have a different `entry` point? A different `contentBase` for static assets?

For this reason, **our webpack configuration is patchable**.

Simply place a `webpack.config.js` at the root of your project, and any settings in there will override our defaults. Any settings _not_ in there will fall back to our defaults.

This allows _some_ control, while abstracting away most other complexity.

## Contributing

Issues, Pull Requests and extensions are welcome. No question is a silly question. Head on over to [issues](https://github.com/contiamo/operational-scripts/issues) to see where you could get involved, or to open one that will help us further improve Operational Scripts.

## Footnotes

* [1] **Reasonable Project Structure**: your code lives in `src` at the root of your project.
* [2] **Configuration File**: at Contiamo, we try to expose _some_ runtime configuration of our applications in order to have more flexible frontend deployments, allowing our Ops team to pass in certain configuration values as [Kubernetes configmaps](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/). This file is _completely optional_ and does not _need_ a place in your codebase: it can be safely deleted.
