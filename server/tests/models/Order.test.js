const mongoose = require('mongoose');
const Order = require('../../models/Order');

describe('Order model', () => {
	test('requires user, itemsPrice and totalPrice', () => {
		const order = new Order({});
		const validationError = order.validateSync();

		expect(validationError).toBeDefined();
		expect(validationError.errors.user).toBeDefined();
		expect(validationError.errors.itemsPrice).toBeDefined();
		expect(validationError.errors.totalPrice).toBeDefined();
	});

	test('sets default payment status and order status', () => {
		const order = new Order({
			user: new mongoose.Types.ObjectId(),
			items: [{
				product: new mongoose.Types.ObjectId(),
				quantity: 1
			}],
			shippingAddress: {
				name: 'Test User',
				email: 'test@example.com',
				phone: '9999999999',
				street: 'Test Street'
			},
			itemsPrice: 100,
			totalPrice: 100
		});

		expect(order.paymentStatus).toBe('Pending');
		expect(order.status).toBe('Pending');
	});
});

