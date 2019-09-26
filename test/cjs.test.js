import StylelintWebpackPlugin from '../src';
import CJSStylelintWebpackPlugin from '../src/cjs';

describe('cjs', () => {
  it('should exported plugin', () => {
    expect(CJSStylelintWebpackPlugin).toEqual(StylelintWebpackPlugin);
  });
});
