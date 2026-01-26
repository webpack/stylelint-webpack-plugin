import { join } from "node:path";

import pack from "./utils/pack";

describe("error", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return error if file is bad", async () => {
    const compiler = pack("error");
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should propagate stylelint lint exceptions as errors", async () => {
    // Mock that throws when lint() is called
    const mockStylelintPath = join(__dirname, "mock/stylelint-error");

    const compiler = pack("good", { stylelintPath: mockStylelintPath });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should propagate stylelint load exceptions as errors", async () => {
    // Mock that throws when the module is loaded
    const mockStylelintPath = join(__dirname, "mock/stylelint-load-error");

    const compiler = pack("good", { stylelintPath: mockStylelintPath });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
