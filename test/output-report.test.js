import { join } from 'path';

import { existsSync } from 'fs-extra';

import pack from './utils/pack';

describe('output report', () => {
  it('should output report a default formatter', async () => {
    const filePath = 'report.txt';
    const compiler = pack('error', {
      outputReport: { filePath },
    });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(existsSync(join(compiler.outputPath, filePath))).toBe(true);
  });

  it('should output report with a custom formatter', async () => {
    const filePath = join(__dirname, 'output', 'report.json');
    const compiler = pack('error', {
      outputReport: {
        filePath,
        formatter: 'json',
      },
    });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(existsSync(filePath)).toBe(true);
  });
});
