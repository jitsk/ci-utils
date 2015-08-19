/*********************
  
  API
  - CK service must be running locally (typically on port 3000)

*********************/

var assert = require('assert'),
    should = require('should');

var ci_utils_config = require('./lib/config.json');

var ci_utils = require("../ci-utils.js")(ci_utils_config);
var api = ci_utils.api;

describe("API", function() {

  describe("GET /helloworld", function() {

    it("should GET /helloworld successfully", function(done) {

      api("get", "/helloworld", { name: "dave" }, function(err, api_err, data) {

        (err === null).should.be.true;
        (api_err === null).should.be.true;
        data.should.be.equal("Hello dave");

        return done();

      })

    });

    it("should fail to GET /helloworld because of missing params", function(done) {

      api("get", "/helloworld", {}, function(err, api_err, data) {

        (err === null).should.be.true;
        api_err.should.be.an.Array.with.lengthOf(1)
        api_err[0].should.be.equal("name is a required parameter");
        (data === null).should.be.true

        return done();

      })

    });

    it("should fail to GET /hello/world because it is an invalid endpoint", function(done) {

      api("get", "/hello/world", {}, function(err, api_err, data) {

        (err === null).should.be.true;
        api_err.should.be.an.Array.with.lengthOf(1)
        api_err[0].should.be.equal("Error making /hello/world API call");
        (data === null).should.be.true

        return done();

      })

    });

    it("should fail to GET /helloworld because the server is not there", function(done) {
      
      var ci_utils_config = require('./lib/bad_config.json');
      var ci_utils = require("../ci-utils.js")(ci_utils_config);
      var api = ci_utils.api;

      api("get", "/hello/world", {}, function(err, api_err, data) {

        err.should.be.an.Array;
        (api_err === null).should.be.true;
        (data === null).should.be.true

        return done();

      })

    });

  });

})