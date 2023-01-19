/**
 * @param {import('stylelint')} stylelint
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
function isPathIgnored(stylelint, filePath) {
  return new Promise((resolve) => {
    resolve(filePath.endsWith('ignore.scss'));
  });
}

module.exports = isPathIgnored;
