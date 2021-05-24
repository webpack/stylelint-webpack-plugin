import { getStylelintOptions } from '../src/options';

describe('eslint options', () => {
  it('should filter plugin options', () => {
    const options = {
      formatter: 'json',
      emitError: false,
    };
    expect(getStylelintOptions(options)).toStrictEqual({
      formatter: 'json',
    });
  });

  it('should keep the stylelint options', () => {
    const options = {
      stylelintPath: 'some/place/where/stylelint/lives',
      formatter: 'json',
      files: ['file.scss'],
      emitError: false,
      emitWarning: false,
      failOnError: true,
      failOnWarning: true,
      quiet: false,
      outputReport: true,
    };
    expect(getStylelintOptions(options)).toStrictEqual({
      formatter: 'json',
      files: ['file.scss'],
    });
  });
});
