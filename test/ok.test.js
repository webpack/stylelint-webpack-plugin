import pack from "./utils/pack";

describe("ok", () => {
  it("should don't throw error if file is ok", async () => {
    const compiler = pack("good");
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
