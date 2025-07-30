import pack from "./utils/pack";

describe("emit error", () => {
  it("should not emit errors if emitError is false", async () => {
    const compiler = pack("error", { emitError: false });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });

  it("should emit errors if emitError is undefined", async () => {
    const compiler = pack("error");
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it("should emit errors if emitError is true", async () => {
    const compiler = pack("error", { emitError: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it("should emit errors, but not warnings if emitError is true and emitWarning is false", async () => {
    const compiler = pack("full-of-problems", {
      emitError: true,
      emitWarning: false,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should emit errors and warnings if emitError is true and emitWarning is undefined", async () => {
    const compiler = pack("full-of-problems", { emitError: true });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(true);
  });
});
