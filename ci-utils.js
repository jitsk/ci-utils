var _ 			= require('underscore');

// Global config - should be supplied at point of inclusion
utils_config = {};

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

module.exports = function(init_config) {

	if(_.isUndefined(init_config)) {
		var init_config = {};
	}	
	utils_config = configOK(init_config);

	var api = require('./includes/api.js');
	
	var logger = require('./includes/logger.js');

	return { 
		api: api.api, 
		logger: logger.logger
	};
	
}
