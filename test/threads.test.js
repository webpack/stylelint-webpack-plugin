import { join } from 'path';

import { loadStylelint, loadStylelintThreaded } from '../src/getStylelint';

describe('Threading', () => {
  test('Threaded interface should look like non-threaded interface', async () => {
    const single = loadStylelint({});
    const threaded = loadStylelintThreaded('foo', 1, {});
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    // expect(single.stylelint).not.toBe(threaded.stylelint);
    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  test('Threaded should lint files', async () => {
    const threaded = loadStylelintThreaded('bar', 1, {});
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(join(__dirname, 'fixtures/good/test.scss')),
        threaded.lintFiles(join(__dirname, 'fixtures/error/test.scss')),
      ]);
      expect(good[0].errored).toBe(false);
      expect(bad[0].errored).toBe(true);
    } finally {
      threaded.cleanup();
    }
  });

  describe('worker coverage', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('worker can start', async () => {
      const mockThread = { parentPort: { on: jest.fn() }, workerData: {} };
      const mockLintFiles = jest.fn().mockReturnValue({
        results: [],
      });
      jest.mock('stylelint', () => {
        return { lint: mockLintFiles };
      });
      jest.mock('worker_threads', () => mockThread);
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const { setup, lintFiles } = require('../src/worker');

      setup({});
      await lintFiles('foo');
      expect(mockLintFiles).toHaveBeenCalledWith({ files: 'foo' });
    });
  });
});
