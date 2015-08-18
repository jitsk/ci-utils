var _ 				= require('underscore'),
		request 	= require('request'),
		moment 		= require('moment');

var configOK = function(utils_config) {

	// Check required config is present and correct (and put in defaults if otherwise)...
	
	var err = [];
	
	if(_.isUndefined(utils_config.logger)) {
		err.push('ci-utils requires a logger object.');
	} else {
		if(_.isUndefined(utils_config.logger.host)) {
			err.push('ci-utils requires a logger.host value.');
		}
	}

	if(!_.isEmpty(err)) {
		console.log('');
		console.log('*** CI-UTILS : LOGGER CONFIG ERROR ***');
		console.log(JSON.stringify(err,null,2));
		console.log('*** CI-UTILS : LOGGER CONFIG ERROR ***');
		console.log('');
		process.exit();
	}
	
	return utils_config;
	
}

// Receive a log request with some params
var logger = function(config) {

	// Confirm  utils_config is set
	var utils_config = config || {};

	return function(method, url, params, callback) {

		// confirm config is ok
		utils_config = configOK(utils_config);
		
		// Sanitise & verify...
		var err = [];
		
		if(_.isUndefined(method)) {
			method = '';
		}
		method = method.toLowerCase().trim();
		
		if(method !== 'post' && method !== 'get' && method !== 'delete' && method !== 'put') {
			err.push('Unrecognised \'method\' parameter for ci-utils logger: ' + method);			
		}
		
		if(_.isUndefined(url)) {
			url = '';
			err.push('Undefined \'url\' parameter for ci-utils logger');	
		}
		url = url.trim();
		
		if(_.isUndefined(params)) {
			params = {};
		} else if(!_.isObject(params)) {
			err.push('Unrecognised \'params\' parameter for ci-utils logger');	
		}
		
		// Logger is expecting params to resemble
		// with an error:
		// { data: { [data] }, error: { [err ] } }
		// without an error:
		// { data: { [data] }, error: null }
		if(_.isUndefined(params.data)) {
			params.data = {};
		}
		if(_.isUndefined(params.error)) {
			params.error = null;
		}	
		
		// Fallen at first hurdle?	
		if(!_.isEmpty(err)) {
		
			console.log('====================================================');
			console.log('CI-UTILS LOGGER ERROR RESPONSE');
			console.log(JSON.stringify(err,null,2));
			console.log('');
			console.log('CI-UTILS LOGGER ERROR ORIGINAL CALL');
			console.log(JSON.stringify(opts,null,2));

			// if we have a callback, use that
			if (_.isFunction(callback)) {
				return callback({ request: null, api: err }, null);
			}
		
		} else {
		
			var opts = {
				method: method,
				url: utils_config.logger.host + (!_.isUndefined(utils_config.logger.port)?':' + utils_config.logger.port:'') + url
			}

			// we need to stringify this stuff
			params = JSON.stringify(params);
			
			if (method === "get" && !_.isNull(params)) {
				opts.qs = { data: params };
			}	else if (!_.isNull(params)) {
				opts.form = { data: params };
			}

			request(opts, function(error, response, body) {

				var errobj = {
					request: null,
					api: null
				}

				// Format the body
				try {
					body = JSON.parse(body);
				}

				catch (exception) {
					var original_body = body;
					var body = {};
				}

				// Defensive code around the response
				if (!_.isObject(response)) {
					var response = {};
				}
				
				if (error || response.statusCode !== 200 || (!_.isUndefined(body.success) && body.success === false)) {

					// Negative response :(
		
					if (!_.isNull(error)) {
						errobj.request = error.code;
					}

					else if (!_.isUndefined(body.errors)) {
						errobj.api = body.errors;
					}

					else {
						errobj.request = original_body;
					}

					console.log('====================================================');
					console.log('CI-UTILS LOGGER ERROR RESPONSE - ' + moment().format('DD-MM-YYYY HH:mm:ss'));
					console.log(JSON.stringify(errobj,null,2));
					console.log('');
					console.log('CI-UTILS LOGGER ERROR ORIGINAL CALL');
					console.log(opts);

					// if we have a callback, use that
					if (_.isFunction(callback)) {
						return callback(errobj, null);
					}

				} else {
				
					// OK response :)
					
					console.log('====================================================');
					console.log('CI-UTILS LOGGER Ops Log Created - ' + moment().format('DD-MM-YYYY HH:mm:ss'));
					console.log(JSON.stringify(body,null,2));

					// if we have a callback, use that
					if (_.isFunction(callback)) {

						if (!_.isUndefined(body.data) && !_.isUndefined(body.data.doc)) {
							return callback(null, body.data.doc);
						}
						return callback(null, body);
						
					}	
				
				}
		
			});		
		
		}

	}

}

module.exports = {
	logger: logger
}