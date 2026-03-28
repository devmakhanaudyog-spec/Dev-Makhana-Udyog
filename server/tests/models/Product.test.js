const Product = require('../../models/Product');

describe('Product model', () => {
	test('requires name, description and price', () => {
		const product = new Product({});
		const validationError = product.validateSync();

		expect(validationError).toBeDefined();
		expect(validationError.errors.name).toBeDefined();
		expect(validationError.errors.description).toBeDefined();
		expect(validationError.errors.price).toBeDefined();
	});

	test('calculates discountedPrice virtual', () => {
		const product = new Product({
			name: 'Premium Makhana',
			description: 'Test description',
			price: 100,
			discount: 10
		});

		expect(product.discountedPrice).toBe(90);
	});
});

