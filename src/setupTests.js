// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('axios', () => ({
	__esModule: true,
	default: {
		defaults: {
			headers: {
				common: {}
			}
		},
		interceptors: {
			request: {
				use: jest.fn(),
				eject: jest.fn()
			},
			response: {
				use: jest.fn(),
				eject: jest.fn()
			}
		},
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
		create: jest.fn(function create() {
			return this;
		})
	}
}));
