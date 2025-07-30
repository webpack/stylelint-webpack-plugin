import pack from "./utils/pack";

describe("fail on error", () => {
  it("should emits errors", async () => {
    const compiler = pack("error", { failOnError: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it("should emit warnings when disabled", async () => {
    const compiler = pack("error", { failOnError: false });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(true);
  });

  it("should correctly indentifies a success", async () => {
    const compiler = pack("good", { failOnError: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
