var _ 				= require('underscore'),
		request 	= require('request');
		
// Include 'sibling' logger function
var logger 		= require('./logger.js').logger;

// Receive an API request with some params
var api = function(method, url, params, callback) {

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

		// Format the body
		try {
			body = JSON.parse(body);
		}

		catch (exception) {
			var original_body = body;
			var body = {};
		}

		// Catch duff response
		if (!_.isObject(response)) {
			var response = {};
		}

		if(error) {
		
			// Error making the request, time to log this.
			
			var log = { 
				data: opts,
				error: error,
				project: utils_config.project
			}

			logger('post', '/request/fail', log);
			
			return callback(error, null, null);
		
		}

		if (response.statusCode !== 200 || (!_.isUndefined(body.success) && body.success === false)) {
		
			if(!_.isUndefined(body.errors)) {
			
				// Should be a response from the API call made (e.g 'You're missing params X, Y, Z')
				return callback(null, body.errors, null);
			
			}						

			// Error, but no specifics...
			var e = [];
			e.push('Error making ' + url + ' API call');
			return callback(null, e, null);
				
		}
		
		// All OK
		return callback(null, null, body);

	});		

}

module.exports = {
	api: api
}