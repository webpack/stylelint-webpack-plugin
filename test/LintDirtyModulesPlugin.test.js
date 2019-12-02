import LintDirtyModulesPlugin from '../src/LintDirtyModulesPlugin';
import linter from '../src/linter';

jest.mock('../src/linter');

describe('lint dirty modules only', () => {
  let plugin;
  let callback;

  beforeAll(() => {
    callback = jest.fn();

    plugin = new LintDirtyModulesPlugin(null, { files: ['**\\*.s?(c|a)ss'] });
  });

  beforeEach(() => {
    linter.mockRestore();
    callback.mockRestore();
  });

  it('skips linting on initial run', () => {
    expect(plugin.isFirstRun).toBe(true);
    expect(callback).not.toBeCalled();

    plugin.apply({}, callback);

    expect(plugin.isFirstRun).toBe(false);
    expect(callback).toBeCalledTimes(1);
  });

  it('linting on change file', () => {
    const fileTimestamps = new Map([
      ['foo/changed.scss', 1],
      ['bar\\changed.scss', 1],
      ['new-file.scss'],
    ]);

    plugin.isFirstRun = false;
    plugin.prevTimestamps = new Map([
      ['foo/changed.scss', 2],
      ['bar\\changed.scss', 2],
    ]);
    plugin.apply({ fileTimestamps }, callback);

    expect(linter).toBeCalledTimes(1);
    expect(callback).not.toBeCalled();
  });

  it('not linter if files are not changed', () => {
    const fileTimestamps = new Map([['not-changed.scss', { timestamp: 1 }]]);

    plugin.isFirstRun = false;
    plugin.prevTimestamps = fileTimestamps;
    plugin.apply({ fileTimestamps }, callback);

    expect(linter).not.toBeCalled();
    expect(callback).toBeCalledTimes(1);
  });
});
