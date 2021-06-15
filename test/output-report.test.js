import { join } from 'path';

import { existsSync } from 'fs-extra';

import pack from './utils/pack';

describe('output report', () => {
  it('should output report a default formatter', (done) => {
    const filePath = 'report.txt';
    const compiler = pack('error', {
      outputReport: { filePath },
    });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(existsSync(join(compiler.outputPath, filePath))).toBe(true);
      done();
    });
  });

  it('should output report with a custom formatter', (done) => {
    const filePath = join(__dirname, 'output', 'report.json');
    const compiler = pack('error', {
      outputReport: {
        filePath,
        formatter: 'json',
      },
    });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(existsSync(filePath)).toBe(true);
      done();
    });
  });
});
