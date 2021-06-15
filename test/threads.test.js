import { join } from 'path';

// @ts-ignore
import normalizePath from 'normalize-path';

import getStylelint from '../src/getStylelint';

import pack from './utils/pack';

describe('Threading', () => {
  it("should don't throw error if file is ok with threads", (done) => {
    const compiler = pack('good', { threads: 2 });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  test('Threaded interface should look like non-threaded interface', async () => {
    const single = getStylelint('single', {});
    const threaded = getStylelint('threaded', { threads: 2 });
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  test('Threaded should lint files', async () => {
    const threaded = getStylelint('bar', { threads: true });
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(
          normalizePath(join(__dirname, 'fixtures/good/test.scss'))
        ),
        threaded.lintFiles(
          normalizePath(join(__dirname, 'fixtures/error/test.scss'))
        ),
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
      const { setup, lintFiles } = require('../src/worker');
      const mockThread = { parentPort: { on: jest.fn() }, workerData: {} };
      const mockLintFiles = jest.fn().mockReturnValue({
        results: [],
      });

      jest.mock('worker_threads', () => mockThread);
      jest.mock('stylelint', () => {
        return { lint: mockLintFiles };
      });

      setup({});

      await lintFiles('foo');

      expect(mockLintFiles).toHaveBeenCalledWith({ files: 'foo' });
    });
  });
});
