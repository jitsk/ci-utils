var _ 			= require('underscore');

// Receive a log request with some params
var logger = function(method, url, data) {

	console.log('logger function called...');
	console.log(utils_config.logger.host);

}

module.exports = {
	logger: logger
}