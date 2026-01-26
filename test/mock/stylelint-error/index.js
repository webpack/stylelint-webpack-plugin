// Mock stylelint that throws an error on lint
const stylelint = {
  formatters: {
    string() {
      return "";
    },
  },

  lint() {
    throw new Error("Oh no!");
  },
};

module.exports = stylelint;
// Also export as default for ESM compatibility with dynamic import()
module.exports.default = stylelint;
