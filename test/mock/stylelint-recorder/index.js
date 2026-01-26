// Mock stylelint that records lint calls for testing
const calls = [];

const stylelint = {
  formatters: {
    string(results) {
      return JSON.stringify(results);
    },
  },

  lint(options) {
    calls.push(options);
    return {
      results: [],
    };
  },
};

// Export the calls array so tests can access it
stylelint._calls = calls;
stylelint._reset = () => {
  calls.length = 0;
};

module.exports = stylelint;
// Also export as default for ESM compatibility with dynamic import()
module.exports.default = stylelint;
