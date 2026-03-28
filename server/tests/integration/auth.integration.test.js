describe('Auth integration route wiring', () => {
	test('auth router module loads', () => {
		const authRouter = require('../../routes/auth');
		expect(authRouter).toBeDefined();
		expect(typeof authRouter.use).toBe('function');
	});
});

