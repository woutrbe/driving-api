const supertest = require('supertest');

const API = 'http://localhost:8080';

describe('POST /route', () => {
	let request;

	beforeAll(() => {
		request = supertest(API);
	});

	it('should be available', () => {
		return request
			.post('/route')
			.send([
				[20, 20],
				[30, 30]
			])
			.expect(200);
	});

	it('should return 200 with correct parameters', () => {
		return request
			.post('/route')
			.send([
				[20, 20],
				[30, 30]
			])
			.expect(200);
	});

	it('should return an error without any parameters', () => {
		return request
			.post('/route')
			.expect(400);
	});

	it('should return an error without pickup locations', () => {
		return request
			.post('/route')
			.send([
				[20, 20]
			])
			.expect(400);
	});

	it('should return an error with invalid coordinates', () => {
		return request
			.post('/route')
			.send([
				[20, 20],
				[30, 30],
				['d', 30]
			])
			.expect(400);
	});
});

describe('GET /token/:id', () => {
	let request;

	beforeAll(() => {
		request = supertest(API);
	});
	
	it('should be available', () => {
		return request
			.get('/route/asdf')
			.expect(200);
	});

	it('should return 200', () => {
		return request
			.get('/route/asdf')
			.expect(200);
	});

	it('should return an error without ID', () => {
		return request
			.get('/route')
			.expect(404);
	});
});