import LintDirtyModulesPlugin from '../src/LintDirtyModulesPlugin';
import linter from '../src/linter';

import pack from './utils/pack';

jest.mock('../src/linter');

describe('lint dirty modules only', () => {
  let plugin;
  let callback;

  beforeAll(() => {
    callback = jest.fn();

    plugin = new LintDirtyModulesPlugin(null, { files: ['**/*.s?(c|a)ss'] });
    plugin.isFirstRun = false;
  });

  beforeEach(() => {
    linter.mockRestore();
    callback.mockRestore();
  });

  it('skips linting on initial run', (done) => {
    const compiler = pack('error', { lintDirtyModulesOnly: true });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('linting on change file', () => {
    const fileTimestamps = new Map([['changed.scss', 1], ['new-file.scss']]);

    plugin.prevTimestamps = new Map([['changed.scss', 2]]);
    plugin.apply({ fileTimestamps }, callback);

    expect(linter).toBeCalledTimes(1);
    expect(callback).not.toBeCalled();
  });

  it('not linter if files are not changed', () => {
    const fileTimestamps = new Map([['not-changed.scss', 1]]);

    plugin.prevTimestamps = fileTimestamps;
    plugin.apply({ fileTimestamps }, callback);

    expect(linter).not.toBeCalled();
    expect(callback).toBeCalledTimes(1);
  });
});
