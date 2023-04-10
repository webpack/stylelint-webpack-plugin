import pack from './utils/pack';

describe('stylelint lint', () => {
  const mockLintFiles = jest.fn().mockReturnValue({
    results: [],
  });

  beforeAll(() => {
    jest.mock('stylelint', () => {
      return {
        lint: mockLintFiles,
      };
    });

    jest.mock('stylelint/lib/isPathIgnored', () => {
      throw new Error();
    });
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it('should lint one file', (done) => {
    const compiler = pack('lint-one', { configFile: null });

    compiler.run((err) => {
      const files = [expect.stringMatching('test.scss')];
      expect(mockLintFiles).toHaveBeenCalledWith({
        cache: false,
        cacheLocation:
          'node_modules/.cache/stylelint-webpack-plugin/.stylelintcache',
        configFile: null,
        files,
      });
      expect(err).toBeNull();
      done();
    });
  });

  it('should lint two files', (done) => {
    const compiler = pack('lint-two', { configFile: null });

    compiler.run((err) => {
      const files = [
        expect.stringMatching(/test[12]\.scss$/),
        expect.stringMatching(/test[12]\.scss$/),
      ];
      expect(mockLintFiles).toHaveBeenCalledWith({
        cache: false,
        cacheLocation:
          'node_modules/.cache/stylelint-webpack-plugin/.stylelintcache',
        configFile: null,
        files,
      });
      expect(err).toBeNull();
      done();
    });
  });
});
