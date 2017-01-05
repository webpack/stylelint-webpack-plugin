'use strict';

var niv = require('npm-install-version');

var packageName = 'webpack@' + process.env.WEBPACK_VERSION;
niv.install(packageName);

module.exports = niv.require(packageName);
