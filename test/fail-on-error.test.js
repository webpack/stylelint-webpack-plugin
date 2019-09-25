import pack from './utils/pack';

describe('fail on error', () => {
  it('fails on errors when asked to', (done) => {
    const compiler = pack('error', { failOnError: true });

    compiler.run((err) => {
      expect(err.message).toContain('error/test.scss');
      done();
    });
  });
});
