'use strict';

const td = require('testdouble');
const formatter = require('stylelint').formatters.string;

const runCompilation = td.replace('../../lib/run-compilation');

const LintDirtyModulesPlugin = require('../../lib/lint-dirty-modules-plugin');

const configFilePath = getPath('./.stylelintrc');
const glob = require('../../lib/constants').defaultFilesGlob;

describe('lint-dirty-modules-plugin', function () {
  let LintDirtyModulesPluginCloned;
  let compilerMock;
  let optionsMock;

  beforeEach(function () {
    LintDirtyModulesPluginCloned = function () {
      LintDirtyModulesPlugin.apply(this, arguments);
    };
    LintDirtyModulesPluginCloned.prototype = Object.create(LintDirtyModulesPlugin.prototype);
    LintDirtyModulesPluginCloned.prototype.constructor = LintDirtyModulesPlugin;

    compilerMock = {
      callback: null,
      plugin: function plugin (event, callback) {
        this.callback = callback;
      }
    };

    optionsMock = {
      configFile: configFilePath,
      lintDirtyModulesOnly: true,
      formatter: formatter,
      files: [glob]
    };
  });

  it('lint is called on "emit"', function () {
    const lintStub = td.function();
    const doneStub = td.function();
    LintDirtyModulesPluginCloned.prototype.lint = lintStub;
    const compilationMock = {
      fileTimestamps: {
        '/updated.scss': 5
      }
    };
    const plugin = new LintDirtyModulesPluginCloned(compilerMock, optionsMock);

    compilerMock.callback(compilationMock, doneStub);

    expect(plugin.isFirstRun).to.eql(true);
    td.verify(lintStub(compilationMock, doneStub));
  });

  context('#lint()', function () {
    let getChangedFilesStub;
    let doneStub;
    let compilationMock;
    const fileTimestamps = {
      '/test/changed.scss': 5,
      '/test/newly-created.scss': 5
    };
    let pluginMock;
    beforeEach(function () {
      getChangedFilesStub = td.function();
      doneStub = td.function();
      compilationMock = {
        fileTimestamps: {}
      };
      td.when(getChangedFilesStub({}, glob)).thenReturn([]);
      td.when(getChangedFilesStub(fileTimestamps, glob)).thenReturn(Object.keys(fileTimestamps));
      pluginMock = {
        getChangedFiles: getChangedFilesStub,
        compiler: compilerMock,
        options: optionsMock,
        isFirstRun: true
      };
    });

    it('skips compilation on first run', function () {
      expect(pluginMock.isFirstRun).to.eql(true);

      LintDirtyModulesPluginCloned.prototype.lint.call(pluginMock, compilationMock, doneStub);

      td.verify(doneStub());
      expect(pluginMock.isFirstRun).to.eql(false);
      td.verify(getChangedFilesStub(), { times: 0, ignoreExtraArgs: true });
      td.verify(runCompilation(), { times: 0, ignoreExtraArgs: true });
    });

    it('runCompilation is not called if files are not changed', function () {
      pluginMock.isFirstRun = false;

      LintDirtyModulesPluginCloned.prototype.lint.call(pluginMock, compilationMock, doneStub);

      td.verify(doneStub());
      td.verify(runCompilation(), { times: 0, ignoreExtraArgs: true });
    });

    it('runCompilation is called if styles are changed', function () {
      pluginMock.isFirstRun = false;
      compilationMock = {
        fileTimestamps: fileTimestamps
      };

      LintDirtyModulesPluginCloned.prototype.lint.call(pluginMock, compilationMock, doneStub);
      optionsMock.files = Object.keys(fileTimestamps);

      td.verify(runCompilation(optionsMock, compilerMock, doneStub));
    });
  });

  context('#getChangedFiles()', function () {
    let pluginMock;
    before(function () {
      pluginMock = {
        compiler: compilerMock,
        options: optionsMock,
        isFirstRun: true,
        startTime: 10,
        prevTimestamps: {
          '/test/changed.scss': 5,
          '/test/removed.scss': 5,
          '/test/changed.js': 5
        }
      };
    });

    it('returns changed style files', function () {
      const fileTimestamps = {
        '/test/changed.scss': 20,
        '/test/changed.js': 20,
        '/test/newly-created.scss': 15
      };

      const changedFiles = LintDirtyModulesPluginCloned.prototype.getChangedFiles.call(pluginMock, fileTimestamps, glob);

      expect(changedFiles).to.eql([
        '/test/changed.scss',
        '/test/newly-created.scss'
      ]);
    });
  });
});
