import pack from './utils/pack'

describe('parameters', () => {
	it('should supports query strings parameters', done => {
		const compiler = pack('error', {
			configOverrides: {
				rules: { 'string-quotes': false }
			}
		})

		compiler.run((err, stats) => {
			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(false)
			done()
		})
	})
})
