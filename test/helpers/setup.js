'use strict';

var chai = require('chai');

global.expect = chai.expect;

chai.use(require('chai-as-promised'));

// get path from the './test' directory
global.getPath = require('path').join.bind(this, __dirname, '..');
