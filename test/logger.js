/*********************
  
  LOGGER
  - Logger service must be running locally (typically on port 1066)

*********************/

var assert = require('assert'),
    should = require('should');

var ci_utils_config = require('./lib/config.json');

var ci_utils = require("../ci-utils.js")(ci_utils_config);

describe("LOGGER", function() {

  it("should have initialised a valid ci-utils module", function(done) {

    ci_utils.api.should.be.Function;
    ci_utils.logger.should.be.Function;
    ci_utils.s3upload.should.be.Function;

    return done();

  });

})