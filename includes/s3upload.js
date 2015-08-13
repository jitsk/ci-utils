var _ = require('underscore');
  var knox = require('knox');
  var moment = require('moment');

var configOK = function(utils_config) {

	// Check required config is present and correct (and put in defaults if otherwise)...
	
	var err = [];
	
	if(_.isUndefined(utils_config.s3upload)) {
		err.push('ci-utils requires a s3upload object.');
	} else {
		if(_.isUndefined(utils_config.s3upload.key)) {
			err.push('ci-utils requires a s3upload.key value.');
		}
		
		if(_.isUndefined(utils_config.s3upload.secret)) {
			err.push('ci-utils requires a s3upload.secret value.');
		} 
		
		if(_.isUndefined(utils_config.s3upload.bucket)) {
			err.push('ci-utils requires a s3upload.bucket value.');
		}
		
		if(_.isUndefined(utils_config.s3upload.region)) {
			err.push('ci-utils requires a s3upload.region value.');
		} 
		
		if(_.isUndefined(utils_config.s3upload.region)) {
			err.push('ci-utils requires a s3upload.asset_domain value.');
		}       
		 
	
	}

	if(!_.isEmpty(err)) {
		console.log('');
		console.log('*** CI-UTILS : s3upload CONFIG ERROR ***');
		console.log(JSON.stringify(err,null,2));
		console.log('*** CI-UTILS : s3upload CONFIG ERROR ***');
		console.log('');
		process.exit();
	}
	
	return utils_config;
	
}

// Receive a log request with some params
var s3upload = function(config) {

	// Confirm  utils_config is set
  var utils_config = config || {};

	return function(fileFrom, fileTo, fileType, publicRead, callback) {
	 
    // confirm config is ok
    utils_config = configOK(utils_config);

		// make amazon s3 thing
		var filestore = knox.createClient({
												key: utils_config.s3upload.key, 
												secret: utils_config.s3upload.secret, 
												bucket: utils_config.s3upload.bucket,
												region: utils_config.s3upload.region
										});
										
		var params = {"Content-Type": fileType};
										
												
		if (publicRead===true) {	
		   params['x-amz-acl']="public-read";
		}
                  
    var req = filestore.putFile(fileFrom, fileTo, params, function(err, res){

      if(err){
        //console.log(err);
        callback(['Problem uploading your file to s3'],{});
      }
      else if(res.statusCode == 200){
        callback(null,{"asset_location":utils_config.s3upload.asset_domain+fileTo});
      }
      else{
        //console.log(res, res.statusCode)
        //Must be some error
        //console.log("CATCH ALL ERROR");
        callback(['Problem uploading your file to s3 - Status Code ('+res.statusCode+')'],{});
      }
      
    });
	
	}

}

module.exports = {
	s3upload: s3upload
}