import { join } from 'path';

import pack from './utils/pack';

describe('fail on config', () => {
  it('fails when .stylelintrc is not a proper format', (done) => {
    const configFile = join(__dirname, '.badstylelintrc');
    const compiler = pack('error', { configFile });

    compiler.run((err) => {
      expect(err.message).toMatch(/duplicated mapping key|Failed to parse/);
      done();
    });
  });
});
