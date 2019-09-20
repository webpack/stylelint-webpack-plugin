import pack from './utils/pack';

describe('fail on warning', () => {
  it('fails on warnings when asked to', (done) => {
    const compiler = pack('warning', {}, { failOnWarning: true });

    compiler.run((err) => {
      expect(err.message).toContain('warning/test.scss');
      done();
    });
  });
});
