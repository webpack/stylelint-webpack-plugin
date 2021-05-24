module.exports = {
  formatters: {
    string(results) {
      return JSON.stringify(results);
    },
  },

  lint() {
    return {
      results: [
        {
          source: '',
          errored: true,
          warnings: [
            {
              line: 1,
              column: 11,
              rule: 'fake-error',
              severity: 'error',
              text: 'Fake error',
            },
          ],
        },
      ],
    };
  },
};
