jest.mock('axios', () => {
	const mockAxios = {
		defaults: {
			headers: {
				common: {}
			}
		},
		interceptors: {
			request: {
				use: jest.fn()
			},
			response: {
				use: jest.fn()
			}
		}
	};

	return {
		__esModule: true,
		default: mockAxios
	};
});

import axios from 'axios';
import api from './api';
import { API_BASE_URL } from '../config';

describe('api utility', () => {
	test('exports the configured axios instance', () => {
		expect(api).toBe(axios);
	});

	test('sets default base URL and content type header', () => {
		expect(axios.defaults.baseURL).toBe(API_BASE_URL);
		expect(axios.defaults.headers.common['Content-Type']).toBe('application/json');
	});

	test('provides request and response interceptor APIs', () => {
		expect(typeof axios.interceptors.request.use).toBe('function');
		expect(typeof axios.interceptors.response.use).toBe('function');
	});
});
