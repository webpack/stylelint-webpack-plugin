import { parseFoldersToGlobs, parseFiles } from '../src/utils';

jest.mock('fs', () => {
  return {
    statSync(pattern) {
      return {
        isDirectory() {
          return pattern.indexOf('/path/') === 0;
        },
      };
    },
  };
});

test('parseFiles should return relative files from context', () => {
  expect(
    parseFiles(
      ['**/*', '../package-a/src/**/', '../package-b/src/**/'],
      'main/src'
    )
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining('main/src/**/*'),
      expect.stringContaining('main/package-a/src/**'),
      expect.stringContaining('main/package-b/src/**'),
    ])
  );
});

test('parseFoldersToGlobs should return globs for folders', () => {
  const withoutSlash = '/path/to/code';
  const withSlash = `${withoutSlash}/`;

  expect(parseFoldersToGlobs(withoutSlash, 'css')).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.css",
    ]
  `);
  expect(parseFoldersToGlobs(withSlash, 'scss')).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.scss",
    ]
  `);

  expect(
    parseFoldersToGlobs(
      [withoutSlash, withSlash, '/some/file.scss'],
      ['scss', 'css', 'sass']
    )
  ).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.{scss,css,sass}",
      "/path/to/code/**/*.{scss,css,sass}",
      "/some/file.scss",
    ]
  `);

  expect(parseFoldersToGlobs(withoutSlash)).toMatchInlineSnapshot(`
    [
      "/path/to/code/**",
    ]
  `);

  expect(parseFoldersToGlobs(withSlash)).toMatchInlineSnapshot(`
    [
      "/path/to/code/**",
    ]
  `);
});

test('parseFoldersToGlobs should return unmodified globs for globs (ignoring extensions)', () => {
  expect(parseFoldersToGlobs('**.notcss', 'css')).toMatchInlineSnapshot(`
    [
      "**.notcss",
    ]
  `);
});
