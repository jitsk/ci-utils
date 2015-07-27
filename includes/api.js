var _ 			= require('underscore');

// Receive an API request with some params
var api = function(method, url, data, callback) {

	console.log('api function called...');
	console.log(utils_config.api_request.host);
	console.log(utils_config.api_request.port);
	
	var err = null;
	var api_err = null;
	var data = null;
	return callback(err, api_err, data);

}

module.exports = {
	api: api
}