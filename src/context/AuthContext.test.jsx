import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';

const AuthStateProbe = () => {
	const auth = useAuth();

	return (
		<>
			<div data-testid="loading">{String(auth.loading)}</div>
			<div data-testid="is-auth">{String(auth.isAuthenticated)}</div>
			<button
				onClick={async () => {
					await auth.login('USER@EXAMPLE.COM', 'secret');
				}}
			>
				Trigger Login
			</button>
		</>
	);
};

describe('AuthContext', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
		axios.get.mockResolvedValue({ data: { _id: 'u1', name: 'User' } });
	});

	test('starts unauthenticated when there is no token', async () => {
		render(
			<AuthProvider>
				<AuthStateProbe />
			</AuthProvider>
		);

		await waitFor(() => {
			expect(screen.getByTestId('loading')).toHaveTextContent('false');
		});

		expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
		expect(axios.get).not.toHaveBeenCalled();
	});

	test('login stores token and authenticates user', async () => {
		axios.post.mockResolvedValue({
			data: {
				token: 'token-123',
				_id: 'u1',
				name: 'User',
				role: 'customer'
			}
		});

		render(
			<AuthProvider>
				<AuthStateProbe />
			</AuthProvider>
		);

		screen.getByRole('button', { name: /trigger login/i }).click();

		await waitFor(() => {
			expect(localStorage.getItem('token')).toBe('token-123');
		});

		await waitFor(() => {
			expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
		});
	});
});
