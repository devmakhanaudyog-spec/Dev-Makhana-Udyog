const User = require('../../models/User');

describe('User model', () => {
	test('requires name, email and password', () => {
		const user = new User({});
		const validationError = user.validateSync();

		expect(validationError).toBeDefined();
		expect(validationError.errors.name).toBeDefined();
		expect(validationError.errors.email).toBeDefined();
		expect(validationError.errors.password).toBeDefined();
	});

	test('defaults role to user', () => {
		const user = new User({
			name: 'Test User',
			email: 'test@example.com',
			password: 'secret123'
		});

		expect(user.role).toBe('user');
	});
});

