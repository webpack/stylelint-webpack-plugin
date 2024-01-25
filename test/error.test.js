import pack from './utils/pack';

describe('error', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return error if file is bad', async () => {
    const compiler = pack('error');
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should propagate stylelint exceptions as errors', async () => {
    jest.mock('stylelint', () => {
      throw new Error('Oh no!');
    });

    const compiler = pack('good');
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
