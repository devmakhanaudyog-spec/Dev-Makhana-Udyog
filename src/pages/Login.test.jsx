import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import toast from 'react-hot-toast';
import api from '../utils/api';

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
const mockSetUser = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <span>{children}</span>
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    logout: mockLogout,
    isAuthenticated: false,
    setUser: mockSetUser
  })
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../components/OTPVerificationModal', () => () => <div>OTP Modal</div>);

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <>{children}</>,
  GoogleLogin: () => <button type="button">Google Login</button>
}));

jest.mock('../utils/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}));

describe('Login signup form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows signup fields when toggled', () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your phone number/i)).toBeInTheDocument();
  });

  test('submits signup data and opens otp flow', async () => {
    api.post.mockResolvedValue({
      data: {
        requiresOTP: true
      }
    });

    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    fireEvent.change(screen.getByPlaceholderText(/enter your full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'USER@EXAMPLE.COM' }
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'secret123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your phone number/i), {
      target: { value: '9999999999' }
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Test User',
        email: 'user@example.com',
        password: 'secret123',
        phone: '9999999999'
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Account created! Please verify your email.');
    });

    expect(await screen.findByText(/otp modal/i)).toBeInTheDocument();
  });
});
