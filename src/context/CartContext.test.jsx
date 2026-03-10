import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

jest.mock('./AuthContext', () => ({
	useAuth: () => ({ user: null })
}));

const CartProbe = () => {
	const cart = useCart();
	const sampleProduct = { _id: 'p1', name: 'Makhana', price: '100' };

	return (
		<>
			<div data-testid="cart-count">{cart.cartCount}</div>
			<div data-testid="cart-total">{cart.cartTotal}</div>
			<button onClick={() => cart.addToCart(sampleProduct, 2, 1)}>Add Item</button>
			<button onClick={() => cart.updateQuantity('p1', 3)}>Set Qty 3</button>
		</>
	);
};

describe('CartContext', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('starts with empty guest cart', () => {
		render(
			<CartProvider>
				<CartProbe />
			</CartProvider>
		);

		expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
		expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
	});

	test('adds item and updates quantity with correct total', () => {
		render(
			<CartProvider>
				<CartProbe />
			</CartProvider>
		);

		fireEvent.click(screen.getByRole('button', { name: /add item/i }));
		expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
		expect(screen.getByTestId('cart-total')).toHaveTextContent('200');

		fireEvent.click(screen.getByRole('button', { name: /set qty 3/i }));
		expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
		expect(screen.getByTestId('cart-total')).toHaveTextContent('300');
	});
});
