var _ 				= require('underscore'),
		request 	= require('request'),
		moment 		= require('moment');

// Receive a log request with some params
var logger = function(method, url, params) {

	// Sanitise & verify...
	var err = [];
	
	if(_.isUndefined(method)) {
		method = '';
	}
	method = method.toLowerCase().trim();
	
	if(method !== 'post' && method !== 'get' && method !== 'delete' && method !== 'put') {
		err.push('Unrecognised \'method\' parameter for logger: ' + method);			
	}
	
	if(_.isUndefined(url)) {
		url = '';
		err.push('Undefined \'url\' parameter for logger');	
	}
	url = url.trim();
	
	if(_.isUndefined(params)) {
		params = {};
	} else if(!_.isObject(params)) {
		err.push('Unrecognised \'params\' parameter for logger');	
	}

	// Fallen at first hurdle?	
	if(!_.isEmpty(err)) {
	
		console.log('====================================================');
		console.log('LOGGER ERROR RESPONSE');
		console.log(JSON.stringify(err,null,2));
		console.log('');
		console.log('LOGGER ERROR ORIGINAL CALL');
		console.log(JSON.stringify(opts,null,2));
	
	} else {
	
		var opts = {
			method: method,
			url: utils_config.logger.host + (!_.isUndefined(utils_config.logger.port)?':' + utils_config.logger.port:'') + url
		}
	
		if (method === "get" && !_.isNull(params)) {
			opts.qs = params;
		}	else if (!_.isNull(params)) {
			opts.form = params;
		}

		request(opts, function(err, r, b) {

			var errobj = {
				request: null,
				api: null
			}

			// Format the body
			try {
				b = JSON.parse(b);
			}

			catch (exception) {
				var original_b = b;
				var b = {};
			}

			// Defensive code around the response
			if (!_.isObject(r)) {
				var r = {};
			}
			
			if (err || r.statusCode !== 200 || b.success === false) {

				// Negative response :(
	
				if (!_.isNull(err)) {
					errobj.request = err.code;
				}

				else if (_.isObject(b) && !_.isUndefined(b.errors)) {
					errobj.api = b.errors;
				}

				else {
					errobj.request = original_b;
				}

				console.log('====================================================');
				console.log('LOGGER ERROR RESPONSE');
				console.log(JSON.stringify(errobj,null,2));
				console.log('');
				console.log('LOGGER ERROR ORIGINAL CALL');
				console.log(JSON.stringify(opts,null,2));

			} else {
			
				// OK response :)
				
				console.log('====================================================');
				console.log('LOGGER Ops Log Created - ' + moment().format('DD-MM-YYYY HH:mm:ss'));
				console.log(JSON.stringify(b,null,2));			
			
			}
	
		});		
	
	}

}

module.exports = {
	logger: logger
}