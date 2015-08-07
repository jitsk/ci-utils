var _ 			= require('underscore');

var configOK = function(utils_config) {

	// Check required config is present and correct (and put in defaults if otherwise)...
	
	var err = [];
	
	if(_.isUndefined(utils_config.project)) {
		err.push('ci-utils requires a project name.');
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

	var api = require('./includes/api.js').api(utils_config);
	
	var logger = require('./includes/logger.js').logger(utils_config);
	
	var s3upload = require('./includes/s3upload.js').s3upload(utils_config);


	return { 
		api: api, 
		logger: logger,
		s3upload: s3upload
	};
	
}
