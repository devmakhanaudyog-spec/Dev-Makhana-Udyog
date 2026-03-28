const { admin } = require('../../middleware/auth');

describe('Auth middleware', () => {
	test('admin middleware calls next for admin users', () => {
		const req = { user: { role: 'admin' } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const next = jest.fn();

		admin(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test('admin middleware blocks non-admin users', () => {
		const req = { user: { role: 'user' } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const next = jest.fn();

		admin(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized as admin' });
	});
});

