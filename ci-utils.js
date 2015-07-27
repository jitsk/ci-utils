var _ 			= require('underscore');

var configOK = function(utils_config) {

	// This utility class expects a range of config values to be supplied.
	// Check that all are present and correct (and put in defaults if otherwise)...
	
	var err = [];
	
	if(_.isUndefined(utils_config.project)) {
		err.push('ci-utils requires a project name.');
	}
	
	if(_.isUndefined(utils_config.api_request)) {
		err.push('ci-utils requires an api_request object.');
	} else {
		if(_.isUndefined(utils_config.api_request.host)) {
			err.push('ci-utils requires an api_request.host value.');
		}
		if(_.isUndefined(utils_config.api_request.port)) {
			err.push('ci-utils requires an api_request.host value.');
		}
	}
	
	if(_.isUndefined(utils_config.logger)) {
		err.push('ci-utils requires a logger object.');
	} else {
		if(_.isUndefined(utils_config.logger.host)) {
			err.push('ci-utils requires a logger.host value.');
		}
	}

	if(!_.isEmpty(err)) {
		console.log('');
		console.log('*** CI-UTILS CONFIG ERROR ***');
		console.log(JSON.stringify(err,null,2));
		console.log('*** CI-UTILS CONFIG ERROR ***');
		console.log('');
		process.exit();
	}
	
	return utils_config;
	
}

module.exports = function(utils_config) {

	if(_.isUndefined(utils_config)) {
		var utils_config = {};
	}	
	utils_config = configOK(utils_config);





	
	

	
	
	// Receive a log request with some params
	var logger = function(method, url, data) {

		console.log('logger function called...');
		console.log(utils_config.logger.host);

	}
	
	
	
	
	
	
	
	
	
	
	

	// Receive an API request with some params
	var api = function(method, url, data, callback) {

		console.log('api function called...');
		console.log(utils_config.api_request.host);
		console.log(utils_config.api_request.port);

	}





	return { 
		api: api, 
		logger: logger
	};
	
}
