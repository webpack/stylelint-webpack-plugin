# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2019-09-30)

### Bug Fixes

* Handle compilation.fileTimestamps for webpack 4
* DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead
* Update option `emitError`
* Update option `failOnError`

### Features

* Modernize project to latest defaults
* Validate options
* Support absolute paths in files array
* New option `stylelintPath`
* New option `emitWarning`
* New option `failOnWarning`
* New option `quiet`

### ⚠ BREAKING CHANGES

* Drop support for Node < 8.9.0
* Minimum supported `webpack` version is 4
* Minimum supported `stylelint` version is 9
