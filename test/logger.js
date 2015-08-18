/*********************
  
  LOGGER
  - Logger service must be running locally (typically on port 1066)

*********************/

var assert = require('assert'),
    should = require('should');

var ci_utils_config = require('./lib/config.json');

var ci_utils = require("../ci-utils.js")(ci_utils_config);
var logger = ci_utils.logger;

describe("LOGGER", function() {

  describe("POST /queue/fail", function() {

    it("should add a /queue/fail log successfully", function(done) {

      var params = {
        data: { queue_name: "test_queue", queue_data: { foo: "bar" } },
        error: { something: "happened" }
      }

      logger("post", "/queue/fail", params, function(err, data) {

        (err === null).should.be.true;
        data.should.have.properties("_id", "_rev", "success", "action", "type", "data", "log_date", "slack_channel");
        data.success.should.be.false;
        data.type.should.be.equal("queue");
        data.action.should.be.equal("fail");
        data.slack_channel.should.be.equal("logs-crashes");

        return done();

      })

    });

  });

  describe("POST /redshift/query", function() {

    it("should add a /redshift/query log successfully", function(done) {

      var params = {
        data: "SELECT * FROM table",
        error: { something: "happened" }
      }

      logger("post", "/redshift/query", params, function(err, data) {

        (err === null).should.be.true;
        data.should.have.properties("_id", "_rev", "success", "action", "type", "data", "log_date", "slack_channel");
        data.success.should.be.false;
        data.type.should.be.equal("redshift");
        data.action.should.be.equal("query");
        data.slack_channel.should.be.equal("redshift");

        return done();

      })

    });

  });

  describe("POST /request/fail", function() {

    it("should fail to add a /request/fail log successfully because it requires a project", function(done) {

      var params = {
        data: { masheryid: "enablemedia" },
        error: { something: "happened" }
      }

      logger("post", "/request/fail", params, function(err, data) {

        (err === null).should.be.false;
        err.should.be.an.Object
        err.should.have.properties("request", "api");
        (err.request === null).should.be.true;
        err.api.should.be.an.Array.with.lengthOf(1);
        err.api[0].should.be.equal("data parameter should contain a project field")

        return done();

      })

    });

  });

  describe("POST /request/fail", function() {

    it("should add a /request/fail log successfully because we supplied a project", function(done) {

      var params = {
        data: { masheryid: "enablemedia" },
        error: { something: "happened" },
        project: "test_project"
      }

      logger("post", "/request/fail", params, function(err, data) {

        (err === null).should.be.true;
        data.should.have.properties("_id", "_rev", "success", "action", "type", "data", "log_date", "slack_channel");
        data.success.should.be.false;
        data.type.should.be.equal("request");
        data.action.should.be.equal("fail");
        data.slack_channel.should.be.equal("logs-crashes");

        return done();

      })

    });

  });

  describe("POST /syndication/api", function() {

    it("should add a /syndication/api log successfully", function(done) {

      var params = {
        data: { masheryid: "enablemedia" },
        error: { something: "happened" }
      }

      logger("post", "/syndication/api", params, function(err, data) {

        (err === null).should.be.true;
        data.should.have.properties("_id", "_rev", "success", "action", "type", "data", "log_date", "slack_channel");
        data.success.should.be.false;
        data.type.should.be.equal("syndication");
        data.action.should.be.equal("api");
        data.slack_channel.should.be.equal("logs-syndication");

        return done();

      })

    });

  });

  describe("POST /syndication/file", function() {

    it("should add a /syndication/file log successfully", function(done) {

      var params = {
        data: { masheryid: "enablemedia" },
        error: { something: "happened" }
      }

      logger("post", "/syndication/file", params, function(err, data) {

        (err === null).should.be.true;
        data.should.have.properties("_id", "_rev", "success", "action", "type", "data", "log_date", "slack_channel");
        data.success.should.be.false;
        data.type.should.be.equal("syndication");
        data.action.should.be.equal("file");
        data.slack_channel.should.be.equal("logs-syndication");

        return done();

      })

    });

  });

})