import { join } from 'path';

import pack from './utils/pack';

describe('fail on config', () => {
  it('fails when .stylelintrc is not a proper format', async () => {
    const configFile = join(__dirname, '.badstylelintrc');
    const compiler = pack('error', { configFile });
    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(errors).toHaveLength(1);
  });
});
