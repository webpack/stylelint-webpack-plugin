const chai = require('chai');

global.expect = chai.expect;

// get path from the './test' directory
global.getPath = require('path').join.bind(this, __dirname, '..');
