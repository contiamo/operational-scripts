# Operational Scripts

> scaffolding for web applications

At Contiamo, we deal with a number of different UI projects written in TypeScript. Each project begins as a [greenfield project](https://en.wikipedia.org/wiki/Greenfield_project) and usually is scaffolded with starter scripts configured to handle things like [code style settings](https://prettier.io/docs/en/configuration.html), TypeScript compiler options, [linting](https://palantir.github.io/tslint/), [precommit hooks on git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks), _et cetera_. This starter then grows organically, while its scaffolding scripts go through a number of tweaks.

The end result is an array of no-longer- starter TypeScript codebases that have distinct scaffolding and lack some type of general consistency, homogeny or _glue_. Instead, we'd like each project to be consistent in its scaffolding, from starter to production, in order to allow each member of our team to be able to immediately read and understand the TypeScript codebase, while abstracting away the complexity of maintaining and piecing together starter scaffolding: dev servers, linters, and other things.

While this starter is no silver bullet to end all onboarding and scalable maintainability, it is an attempt to remedy the problem in a way that is **[TypeScript](https://github.com/Microsoft/TypeScript/) first:** Operational Scripts allows us to hit the ground running with TypeScript, handling all of the scaffolding around it, including: webpack packaging, development servers, linters taken care of with optimal settings.

Ideally, with this starter, everything _just works_ so long as we have a reasonable project structure<sup>[[1]](#footnotes)</sup>.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Getting Started](#getting-started)
- [Nuances](#nuances)
  - [Build Script](#build-script)
  - [Webpack](#webpack)
    - [Function Webpack Configs](#function-webpack-configs)
- [Contributing](#contributing)
- [Footnotes](#footnotes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting Started

- `npm install @operational/scripts -D`

Running this command will:

- Replace any scaffolding: TypeScript configuration (`tsconfig.json`), `tslint.json` and `.prettierrc` in your current project with our recommendations.

* Install a precommit hook that, before commit:
  - Adds a table of contents to Markdown
  - Lints TypeScript
  - Pretty prints everything it can process: TypeScript, Markdown, JavaScript and JSON
* Update your `.gitignore` to include some more files, or adds one if missing
* Add a `public` folder with a starter HTML template and a configuration file<sup>[[2]](#footnotes)</sup>.
* Adds the following scripts to your `package.json` **only if they don't already exist**:
  - `start`: runs [`webpack-serve`](https://github.com/webpack-contrib/webpack-serve) with any extra configuration passed in as flags.
  - `build`: runs the TypeScript compiler _and_ packages for npm. See [Build Script](#build-script) for more info.
  - `test`: runs [Jest](https://github.com/facebook/jest) with TypeScript integration.
  - `prePublishOnly`: checks if the `"main"` file in your `package.json` actually exists before publish.
* Updates your package's `main` file.
  - Our [starter webpack configuration](#webpack-configuration) sets an output file path. We mirror this path in your package's `main` file.

## Nuances

Creating Operational Scripts as scaffolding for our projects required making some interesting decisions about configuration. These are outlined here for transparency.

### Build Script

At Contiamo, we develop web applications that run standalone, _and_ compose into a suite of web applications that is our final product. In order to create these embeddable applications, we need a two-step build process:

1. **Build for production and deployment:** just a standalone, `webpack -p` web app.
2. **Build for Contiamo UI:** this packages the app and prepares it to be published to our internal `npm` registry, or the public registry if open source.

Running `npm build` in a package that uses Operational Scripts will run both steps in parallel. If your use case only requires one or the other, simply use the `--for` flag, specifying the target of the build: `production` or `npm`.

`npm run build -- --for npm`, or `npm run build -- --for production` will build just what you need.

### Webpack

We still want to be flexible with Operational Scripts because our starter projects evolve, and _as they evolve_, we may need to extend the starter's scaffolding in certain ways: perhaps we need more granular control over the dev server? What if we have a different `entry` point? What if we want to use a newer TypeScript loader? Or a different `contentBase` for static assets?

For this reason, **our Webpack configuration is patchable**.

Simply place a `webpack.config.js` at the root of your project, and any settings in there will override our defaults. Any settings _not_ in there will fall back to our defaults.

This allows _some_ control, while abstracting away most other complexity.

#### Function Webpack Configs

In most common cases, webpack configurations are expressed as plain old JavaScript objects. However, in other cases, users might wish to use a function as a `module.export`ed webpack configuration.

Operational Scripts works with this, but has one rule: **the function must use reasonable default parameters**. The reason for this, is that Operational Scripts merges its _own webpack config_ with the return of the custom webpack configuration function. At the time it invokes this function, it has no idea what to pass in as arguments. Therefore, defaults make sense here.

If your use case requires something _even more custom_, perhaps going _full custom_ without Operational Scripts might make more sense in that case. If you're unsure, you are _always_ welcome to [open an issue](https://github.com/contiamo/operational-scripts/issues/new) and we can have a chat about it.

## Contributing

Issues, Pull Requests and extensions are welcome. No question is a silly question. Head on over to [issues](https://github.com/contiamo/operational-scripts/issues) to see where you could get involved, or to open one that will help us further improve this project.

## Footnotes

- [1] **Reasonable Project Structure**: your code lives in `src` at the root of your project.
- [2] **config.js**: at Contiamo, we try to expose _some_ runtime configuration of our applications in order to have more flexible frontend deployments, allowing our Ops team to pass in certain configuration values as [Kubernetes configmaps](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/). This file is _completely optional_ and does not _need_ a place in your codebase: it can be safely deleted if you do not need it.
