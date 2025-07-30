import { join } from "node:path";

import { removeSync, writeFileSync } from "fs-extra";

import pack from "./utils/pack";

const target = join(__dirname, "fixtures", "watch", "entry.scss");
const target2 = join(__dirname, "fixtures", "watch", "leaf.scss");

describe("watch", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    removeSync(target);
    removeSync(target2);
  });

  it("should watch", (done) => {
    const compiler = pack("good");

    watch = compiler.watch({}, (err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it("should watch with unique messages", (done) => {
    writeFileSync(target, "#foo { background: black; }\n");
    writeFileSync(target2, "");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("watch");
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function finish(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    }

    function thirdPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(expect.stringMatching("entry.scss"));
      expect(message).not.toEqual(expect.stringMatching("leaf.scss"));

      next = finish;
      writeFileSync(target, "#bar { background: #000000; }\n");
    }

    function secondPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(expect.stringMatching("entry.scss"));
      expect(message).toEqual(expect.stringMatching("leaf.scss"));

      next = thirdPass;
      writeFileSync(target2, "#bar { background: #000000; }\n");
    }

    function firstPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors).toHaveLength(1);
      const [{ message }] = errors;
      expect(message).toEqual(expect.stringMatching("entry.scss"));
      expect(message).not.toEqual(expect.stringMatching("leaf.scss"));

      next = secondPass;
      writeFileSync(target2, "#bar { background: black; }\n");
      writeFileSync(target, "#foo { background: black; }\n");
    }
  });
});
