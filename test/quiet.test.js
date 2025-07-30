import pack from "./utils/pack";

describe("quiet", () => {
  it("should not emit warnings if quiet is set", async () => {
    const compiler = pack("warning", { quiet: true });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("should emit errors, but not emit warnings if quiet is set", async () => {
    const compiler = pack("full-of-problems", { quiet: true });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
