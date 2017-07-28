/**
 * Used for logging every server request
 */
exports.register = (server, options, next) => {
	server.on('response', request => {
		console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} ${request.response.statusCode}`);
	});

	next();
};

exports.register.attributes = {
	name: 'logger',
};