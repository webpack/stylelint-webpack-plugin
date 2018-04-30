const niv = require('npm-install-version');

const packageName = `webpack@${process.env.WEBPACK_VERSION}`;
niv.install(packageName);

module.exports = niv.require(packageName);
