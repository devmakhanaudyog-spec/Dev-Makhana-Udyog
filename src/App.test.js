import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main navigation content', () => {
  render(<App />);
  expect(screen.getByText(/makhaantraa foods/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
