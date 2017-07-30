const Worker = require('../lib/worker/worker');

describe('worker', () => {
	let worker = null;

	beforeAll(() => {
		worker = new Worker();
	});

	it('should be initialised', () => {
		expect(worker).toBeInstanceOf(Worker);
	});

	it('should have a start method', () => {
		expect(worker.start).toBeDefined();
	});

	it('should have a stop method', () => {
		expect(worker.stop).toBeDefined();
	});

	it('should have a processMsg method', () => {
		expect(worker.processMsg).toBeDefined();
	});

	it('processMsg should error without a msg', () => {
		expect(() => {
			worker.processMsg(null);
		}).toThrow();
	});
});