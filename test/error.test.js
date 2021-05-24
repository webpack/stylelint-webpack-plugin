import pack from './utils/pack';

describe('error', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return error if file is bad', (done) => {
    const compiler = pack('error');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should propagate stylelint exceptions as errors', (done) => {
    jest.mock('stylelint', () => {
      throw new Error('Oh no!');
    });

    const compiler = pack('good');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
