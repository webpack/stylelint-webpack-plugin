'use strict';

let Base;

try {
  // this wasn't added to webpack until v2.5.0, and peerDeps state this package
  // supports webpack@1.x.
  Base = require('webpack/lib/WebpackError');
} catch (e) {
  Base = Error;
}

module.exports = class StylelintPluginError extends Base {
  constructor(message) {
    super(message);
  }
};
