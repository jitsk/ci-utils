/*********************
  
  API
  - CK service must be running locally (typically on port 3000)

*********************/

var assert = require('assert'),
    should = require('should'),
    moment = require('moment');

var ci_utils_config = require('./lib/config.json');

var ci_utils = require("../ci-utils.js")(ci_utils_config);
var s3upload = ci_utils.s3upload;

describe("S3 Upload", function() {

  describe("Upload a file publicly", function() {

    it("should upload a file publicly", function(done) {

      var fs = require('fs');

      var path = __dirname + "/lib/file.txt";
      var time = moment().utc().format("YYYY-MM-DD-HH-mm-ss");
      var publicPath = "/test_upload/" + time + "-public.txt";

      s3upload(path, publicPath, "text/plain", true, function(err, data) {

        (err === null).should.be.true;
        data.should.have.property("asset_location");
        data.asset_location.should.be.equal(ci_utils_config.s3upload.asset_domain.replace(/\/$/, "")+publicPath)

        var request = require('request');

        request(data.asset_location, function(e, r, b) {

          r.statusCode.should.be.equal(200);
          b.should.be.equal("Test upload file");
          return done();
          
        })

      })

    });

    it("should upload a file privately", function(done) {

      var fs = require('fs');

      var path = __dirname + "/lib/file.txt";
      var time = moment().utc().format("YYYY-MM-DD-HH-mm-ss");
      var privatePath = "/test_upload/" + time + "-private.txt";

      s3upload(path, privatePath, "text/plain", false, function(err, data) {

        (err === null).should.be.true;
        data.should.have.property("asset_location");
        data.asset_location.should.be.equal(ci_utils_config.s3upload.asset_domain.replace(/\/$/, "")+privatePath)

        var request = require('request');

        request(data.asset_location, function(e, r, b) {

          r.statusCode.should.be.equal(403) // access denied
          return done();
          
        })

      })

    });

  });

})