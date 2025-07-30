import pack from "./utils/pack";

describe("stylelint lint", () => {
  const mockLintFiles = jest.fn().mockReturnValue({
    results: [],
  });

  beforeAll(() => {
    jest.mock("stylelint", () => ({
      lint: mockLintFiles,
    }));
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one", { configFile: null });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
    const files = [expect.stringMatching("test.scss")];
    expect(mockLintFiles).toHaveBeenCalledWith({
      cache: false,
      cacheLocation:
        "node_modules/.cache/stylelint-webpack-plugin/.stylelintcache",
      configFile: null,
      files,
      quietDeprecationWarnings: true,
    });
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two", { configFile: null });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
    const files = [
      expect.stringMatching(/test[12]\.scss$/),
      expect.stringMatching(/test[12]\.scss$/),
    ];
    expect(mockLintFiles).toHaveBeenCalledWith({
      cache: false,
      cacheLocation:
        "node_modules/.cache/stylelint-webpack-plugin/.stylelintcache",
      configFile: null,
      files,
      quietDeprecationWarnings: true,
    });
  });
});
