<div align="center">
  <a href="https://github.com/stylelint/stylelint"><img width="200" height="200" src="https://cdn.worldvectorlogo.com/logos/stylelint.svg"></a>
  <a href="https://github.com/webpack/webpack"><img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg"></a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# stylelint-webpack-plugin

> This version of `stylelint-webpack-plugin` only works with webpack 5. For webpack 4, see the [2.x branch](https://github.com/webpack-contrib/stylelint-webpack-plugin/tree/2.x).

This plugin uses [`stylelint`](https://stylelint.io/), which helps you avoid errors and enforce conventions in your styles.

## Getting Started

To begin, you'll need to install `stylelint-webpack-plugin`:

```console
npm install stylelint-webpack-plugin --save-dev
```

or

```console
yarn add -D stylelint-webpack-plugin
```

or

```console
pnpm add -D stylelint-webpack-plugin
```

> [!NOTE]
>
> You also need to install `stylelint >= 13` from npm, if you haven't already:

```console
npm install stylelint --save-dev
```

or

```console
yarn add -D stylelint
```

or

```console
pnpm add -D stylelint
```

> [!NOTE]
>
> If you are using Stylelint 13 rather than 14+, you might also need to install `@types/stylelint` as a dev dependency if you encounter Stylelint-related type errors.

Then add the plugin to your webpack configuration. For example:

```js
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new StylelintPlugin(options)],
  // ...
};
```

## Options

See [stylelint's options](https://stylelint.io/user-guide/usage/node-api#options) for the complete list of available options . These options are passed directly to `stylelint`.

### `cache`

- Type:

```ts
type cache = boolean;
```

- Default: `true`

The cache is enabled by default to decrease execution time.

### `cacheLocation`

- Type:

```ts
type cacheLocation = string;
```

- Default: `node_modules/.cache/stylelint-webpack-plugin/.stylelintcache`

Specify the path to the cache location. This can be a file or a directory.

### `configFile`

- Type:

```ts
type context = string;
```

- Default: `undefined`

Specify the config file location to be used by `stylelint`.

> **Note:**
>
> By default this is [handled by `stylelint`](https://stylelint.io/user-guide/configure).

### `context`

- Type:

```ts
type context = string;
```

- Default: `compiler.context`

A string indicating the root of your files.

### `exclude`

- Type:

```ts
type exclude = string | Array<string>;
```

- Default: `['node_modules', compiler.options.output.path]`

Specify the files and/or directories to exclude. Must be relative to `options.context`.

### `extensions`

- Type:

```ts
type extensions = string | Array<string>;
```

- Default: `['css', 'scss', 'sass']`

Specify the extensions that should be checked.

### `files`

- Type:

```ts
type files = string | Array<string>;
```

- Default: `null`

Specify directories, files, or globs. Must be relative to `options.context`. Directories are traversed recursively, looking for files matching `options.extensions`. File and glob patterns ignore `options.extensions`.

### `fix`

- Type:

```ts
type fix = boolean;
```

- Default: `false`

If `true`, `stylelint` will fix as many errors as possible. The fixes are made to the actual source files. All unfixed errors will be reported. See [Autofixing errors](https://stylelint.io/user-guide/usage/options#fix) docs.

### `formatter`

- Type:

```ts
type formatter = string | (
  results: Array<import('stylelint').LintResult>
) => string
```

- Default: `'string'`

Specify the formatter you would like to use to format your results. See the [formatter option](https://stylelint.io/user-guide/usage/options#formatter).

### `lintDirtyModulesOnly`

- Type:

```ts
type lintDirtyModulesOnly = boolean;
```

- Default: `false`

Lint only changed files; skip linting on start.

### `stylelintPath`

- Type:

```ts
type stylelintPath = string;
```

- Default: `stylelint`

Path to `stylelint` instance that will be used for linting.

### `threads`

- Type:

```ts
type threads = boolean | number;
```

- Default: `false`

Set to `true` for an auto-selected pool size based on number of CPUs. Set to a number greater than 1 to set an explicit pool size.

Set to `false`, 1, or less to disable and run only in main process.

### Errors and Warning

**By default, the plugin will automatically adjust error reporting depending on the number of Stylelint errors/warnings.**

You can still force this behavior by using the `emitError` **or** `emitWarning` options:

#### `emitError`

- Type:

```ts
type emitError = boolean;
```

- Default: `true`

The errors found will always be emitted. To disable, set to `false`.

#### `emitWarning`

- Type:

```ts
type emitWarning = boolean;
```

- Default: `true`

The warnings found will always be emitted. To disable, set to `false`.

#### `failOnError`

- Type:

```ts
type failOnError = boolean;
```

- Default: `true`

Will cause the module build to fail if there are any errors. To disable, set to `false`.

#### `failOnWarning`

- Type:

```ts
type failOnWarning = boolean;
```

- Default: `false`

Will cause the module build to fail if there are any warnings, when set to `true`.

#### `quiet`

- Type:

```ts
type quiet = boolean;
```

- Default: `false`

Will process and report errors only, and ignore warnings, when set to `true`.

#### `outputReport`

- Type:

```ts
type outputReport =
  | boolean
  | {
      filePath?: string | undefined;
      formatter?:
        | (
            | string
            | ((results: Array<import('stylelint').LintResult>) => string)
          )
        | undefined;
    };
```

- Default: `false`

Writes the output of the errors to a file - for example, a `json` file for use for reporting.

The `filePath` is relative to the webpack config: `output.path`.

You can pass in a different formatter for the output file. If none is passed in the default/configured formatter will be used.

```js
{
  filePath: 'path/to/file';
  formatter: 'json';
}
```

## Changelog

[Changelog](CHANGELOG.md)

## Contributing

We welcome all contributions!
If you're new here, please take a moment to review our contributing guidelines before submitting issues or pull requests.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/stylelint-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/stylelint-webpack-plugin
[node]: https://img.shields.io/node/v/stylelint-webpack-plugin.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack-contrib/stylelint-webpack-plugin/workflows/stylelint-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack-contrib/stylelint-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack-contrib/stylelint-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/stylelint-webpack-plugin
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=stylelint-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=stylelint-webpack-plugin
