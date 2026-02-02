import { join } from "node:path";

import pack from "./utils/pack";

describe("stylelint lint", () => {
  const mockStylelintPath = join(__dirname, "mock/stylelint-recorder");

  beforeEach(() => {
    // Clear recorded calls before each test
    const mock = require(mockStylelintPath);

    mock._reset();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one", {
      configFile: null,
      stylelintPath: mockStylelintPath,
    });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);

    const mock = require(mockStylelintPath);

    const files = [expect.stringMatching("test.scss")];
    expect(mock._calls[0]).toMatchObject({
      cache: false,
      cacheLocation:
        "node_modules/.cache/stylelint-webpack-plugin/.stylelintcache",
      configFile: null,
      files,
      quietDeprecationWarnings: true,
    });
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two", {
      configFile: null,
      stylelintPath: mockStylelintPath,
    });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);

    const mock = require(mockStylelintPath);

    const files = [
      expect.stringMatching(/test[12]\.scss$/),
      expect.stringMatching(/test[12]\.scss$/),
    ];
    expect(mock._calls[0]).toMatchObject({
      cache: false,
      cacheLocation:
        "node_modules/.cache/stylelint-webpack-plugin/.stylelintcache",
      configFile: null,
      files,
      quietDeprecationWarnings: true,
    });
  });
});
