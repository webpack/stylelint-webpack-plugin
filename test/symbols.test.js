import pack from "./utils/pack";

describe("symbols", () => {
  it("should return error", async () => {
    const compiler = pack("[symbols]");
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
