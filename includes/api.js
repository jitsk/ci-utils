var _ 				= require('underscore'),
		request 	= require('request');

var configOK = function(utils_config) {

	// Check required config is present and correct (and put in defaults if otherwise)...
	var err = [];
	
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

	if(!_.isEmpty(err)) {
		console.log('');
		console.log('*** CI-UTILS : API_REQUEST CONFIG ERROR ***');
		console.log(JSON.stringify(err,null,2));
		console.log('*** CI-UTILS : API_REQUEST CONFIG ERROR ***');
		console.log('');
		process.exit();
	}
	
	return utils_config;
	
}

// Receive an API request with some params
// Be wary! This returns 3 params instead of the usual 2! err, api_err, data
var api = function(config) {

	// Confirm required config is set and available
	var utils_config = config || {};
	utils_config = configOK(utils_config);

	// Include 'sibling' logger function
	var logger = require('./logger.js').logger(utils_config);

	return function(method, url, params, callback) {

		var err = []; 				// this is any error received from the underlying request library (i.e. timed out, connection reset - hard errors
		var api_err = null;		// this is any error response from the API called (i.e. invalid parameters)
		var data = null;			// this is the successful response from the API called

		// Sanitise & verify...	
		if(_.isUndefined(method)) {
			method = '';
		}
		method = method.toLowerCase().trim();
		
		if(method !== 'post' && method !== 'get' && method !== 'delete' && method !== 'put') {
			err.push('Unrecognised \'method\' parameter for ci-utils api: ' + method);			
		}
		
		if(_.isUndefined(url)) {
			url = '';
			err.push('Undefined \'url\' parameter for ci-utils api');	
		}
		url = url.trim();
		
		if(_.isUndefined(params)) {
			params = {};
		} else if(_.isFunction(params) && _.isUndefined(callback)) {
			// No params passed, callback in it's place...
			callback = params;
			params = {};
		} else if(!_.isObject(params)) {
			err.push('Unrecognised \'params\' parameter for ci-utils api');	
		}

		// Fallen at first hurdle?	
		if(!_.isEmpty(err)) {
		
			return callback(err, null, null);
			
		}

		var opts = {
			method: method,
			url: utils_config.api_request.host + (!_.isUndefined(utils_config.api_request.port)?':' + utils_config.api_request.port:'') + url
		}

		if (method === "get" && !_.isNull(params)) {
			opts.qs = params;
		}	else if (!_.isNull(params)) {
			opts.form = params;
		}

		request(opts, function(error, response, body) {

			// Straight forward error making the request - log it as a request fail and get out of here
			if(error) {

				var log = { 
					data: opts,
					error: error,
					project: utils_config.project
				}

				logger('post', '/request/fail', log);
				
				return callback(error, null, null);
			
			}

			// This either worked, or we have a more complex error
			var err = [];
			var api_err = [];
			
			if (!_.isObject(response)) {
				err.push('Unexpected response returned');
				var response = {};
			}

			// Format the body
			try {
				body = JSON.parse(body);
			}

			catch (exception) {
				err.push('Unexpected body returned');
				var original_body = body;
				var body = {};
			}

			if(_.isUndefined(response.statusCode)) {
				err.push('Unable to determine statusCode of response');
			}
			
			if(_.isUndefined(body.success)) {
				err.push('Unable to determine success of response');
			}
			
			if(!_.isUndefined(body.success) && body.success == true && _.isUndefined(body.data)) {
				err.push('Unable to determine data of response');
			}

			if(!_.isUndefined(response.statusCode) && response.statusCode !== 200 
			|| (!_.isUndefined(body.success) && body.success === false)) {
			
				if(!_.isUndefined(body.errors)) {
				
					// Should be a response from the API call made (e.g 'You're missing params X, Y, Z')
					api_err = body.errors;
				
				}	else {					

					// Error, but no specifics...
					api_err.push('Error making ' + url + ' API call');
					
				}
					
			}
			
			// Return api_err	
			if(!_.isEmpty(api_err)) {			
				return callback(null, api_err, null);
			}
			
			// Return err
			if(!_.isEmpty(err)) {			
				return callback(err, null, null);						
			}

			// Must all be OK
			return callback(null, null, body.data);

		});

	}

}

module.exports = {
	api: api
}