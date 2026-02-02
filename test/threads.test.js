import { join } from "node:path";

// @ts-expect-error no types
import normalizePath from "normalize-path";

import getStylelint from "../src/getStylelint";

import pack from "./utils/pack";

describe("Threading", () => {
  it("should don't throw error if file is ok with threads", async () => {
    const compiler = pack("good", { threads: 2 });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("threaded interface should look like non-threaded interface", async () => {
    const single = getStylelint("single", {});
    const threaded = getStylelint("threaded", { threads: 2 });
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  it("threaded should lint files", async () => {
    const threaded = getStylelint("bar", { threads: true });
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(
          normalizePath(join(__dirname, "fixtures/good/test.scss")),
        ),
        threaded.lintFiles(
          normalizePath(join(__dirname, "fixtures/error/test.scss")),
        ),
      ]);
      expect(good[0].errored).toBe(false);
      expect(bad[0].errored).toBe(true);
    } finally {
      threaded.cleanup();
    }
  });

  describe("worker coverage", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("worker can start", async () => {
      const mockStylelintPath = join(__dirname, "mock/stylelint-recorder");

      // Clear any previous calls
      const mock = require(mockStylelintPath);

      mock._reset();

      // Now require the worker (fresh copy due to resetModules)
      const { lintFiles, setup } = require("../src/worker");

      setup({ stylelintPath: mockStylelintPath });

      await lintFiles("foo");

      expect(mock._calls[0]).toMatchObject({
        files: "foo",
        quietDeprecationWarnings: true,
      });
    });
  });
});
