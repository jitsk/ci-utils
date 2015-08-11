# CI-UTILS

## Overview

When producing code for several JS-API projects, it became clear that there were core actions that were replicated in many of them, regardless of the project’s purposes - sending files to Amazon S3, logging error messages, making further REST API calls... Rather than replicate code (or re-write it) across projects, it would be great if there was a one-stop set of universal bridging functions that could perform these tasks. Enter ci-utils. This Swiss army knife of code would speed development time and encourage code to be written in a similar style. 

### Setup

Include ci-utils in your project’s package.json file, to npm install the latest version. 

```"ci-utils": "git+ssh://git@github.com:touchlocal/ci-utils.git"```

You also need to provide some config in your project for ci-utils to work. A required config entry is the ‘project’, so ci-utils knows what to reference your project as. Then config for each individual function of ci-utils you want to use.

```"ci_utils": {
      "project": "[PROJECT NAME]",
      "logger": {
        "host": "http://localhost",
        "port": 1066
      },
      "api_request": {
        "host": "http://localhost",
        "port": 3000
      },
      "s3upload": "@config.amazonS3"
    }```

You do not need to define config for functions you’re not going to use! So, if you’ve no intention of using the Amazon S3 file upload capabilities of ci-utils, you don’t need to define your Amazon credentials in config.

Where ci-utils config replicates that of existing config, you can avoid duplicating the same usernames/passwords/URLs etc. and reference the existing portion of your config structure like so :

```"s3upload": "@config.amazonS3"```

When the config is interpreted, s3upload will magically become equal to whatever is stored in your existing amazonS3 object in your config file.

Typically at the head of your project code you’ll include/fetch your config file.

```var config = require('./includes/config.js').get;```

After this, you can make a request for ci-utils, passing across the portion of config you defined earlier.

```var ci_utils = require('ci-utils')(config.ci_utils);```

You’re then free to make use of any of the ci-util functions, such as :

```var logger = ci_utils.logger;
var api = ci_utils.api;
var s3upload = ci_utils.s3upload;```

Alternatively, you can skip requiring ci_utils on it’s own and call each of these individually, so long as you pass in the config.ci_utils details they need to work, like :

```var logger = require('ci-utils')(config.ci_utils).logger;
var api = require('ci-utils')(config.ci_utils).api;
var s3upload = require('ci-utils')(config.ci_utils).s3upload;```

These will now be primed with the config details they need to work. Some may rely on other standalone projects to also be initialised and running. Details of each of the individual functions follow!

## logger

> To avoid confusion when referring to the logger project (https://github.com/touchlocal/logger) it will be called ‘logger project’, and when referencing the ci-utils function logger it will be called ‘logger’ or ‘logger function’.

Required ci-utils config for logger. 

```"ci_utils": {
	"project": "[PROJECT NAME]",
	"logger": {
		"host": "[URL TO LOGGER PROJECT e.g http://localhost]",
		"port": [PORT LOGGER PROJECT IS RUNNING ON e.g 1066]
	}
}```

Logger is a bridging function to send data to the standalone logger project (https://github.com/touchlocal/logger). So you’ll need to have that project itself up and running so that this function can point to it.

The main purpose of the logger function is to provide a shorthand method of poking the logger project to save a log record (normally when an error has occurred), which will then push a Slack alert out so people are made aware of this particular event. What additional actions are taken after that is up to users/the individual project calling it.

Calls to the logger function are asynchronous - we don’t want to slow up proceedings by waiting for log information to be stored. A call to the logger function expects three parameters. A method (post, get, put or delete - currently it’s likely you will only be using post to store away new logs), an API endpoint URL (as offered by the logger project), and a set of parameters.

The parameters are expected to be of the format :

```{ data: { [data] }, error: { [ERROR ENCOUNTERED] } }```

...when storing a log with an error, and :

```{ data: { [data] }, error: null }```

...when storing a log without an error. Failure to provide the ‘error’ element will result in it being assumed to be null (which generally means you’re logging a successful event).

Typically, the ‘data’ portion will be params as supplied to an API call that has failed, and error will be the error that was returned, thus we can log what particular set or params resulted in an error.
So, if you were in the process of making a syndication call on CindyKate, for example, and this returned an error, a typical call to note this issue with logger might look like :

```logger("post", "/syndication/api", { data: params, error: err });```

...where params is all the values the syndication call was made with and err the error received as a result.

> Behind the scenes, calling this particular logger function makes a POST to the /syndication/api endpoint on the logger project.
> 
> That decides what type of information needs to be stored in the log - log files are, for the most part, comprised of similar information :
> A ‘success’ flag to signify if the log is recording a failure or a success.
> A ‘type’ and ‘action’ pairing that “routes” the information being logged (e.g a type of ‘syndication’ and action of ‘api’ immediately suggests that we’re looking at a log for the CindyKate project which has attempted a syndication call and failed).
> A ‘log_date’ that tells us when this happened.
> A ‘slack_channel’ which informs which Slack channel this log should be brought to people’s attention on.
> And finally, ‘data’ which is the guts of the log itself.
> 
> The log is then saved to the Cloudant database **ops_logs**.
> 
> The logger project has a built in listener that will spot the addition of this new log.
> 
> This will then make a call to Slack to post a message (in the relevant channel) so people can act on it.

So all of the above, which would previously require you crafting a suitable log file, saving it out to Cloudant, and having a logger project style listener running anyway if you wanted this to then be alerted on Slack, boils down to one nice function call; which knows the correct Slack channel to post to and what the log should look like, all from the logger project endpoint you called.

## s3upload

Required ci-utils config for s3upload. 

```"ci_utils": {
	"project": "[PROJECT NAME]",
	"s3upload":  {
		"key": "[S3 KEY]",
		"secret": "[S3 SECRET]",
		"bucket": "[S3 BUCKET e.g production-wolf-assets]",
		"region": "[S3 REGION e.g eu-west-1]",
		"asset_domain": "[S3 ASSET DOMAIN e.g http://dkthlrncwzdcx.cloudfront.net/]"
	}
}```

> Don’t forget, if you already have AmazonS3 credentials in your config, you can clone them using the @config method (see the setup section above).

s3upload is a function to push a file to Amazon S3 for storage. It’s synchronous so will return the outcome of its attempt. It expects four parameters. The path/filename of the file you want to upload. The path/filename you want the file to have when it’s uploaded to S3. The filetype of this file. A boolean true/false to indicate if this file should be made public. The callback, which should expect to receive an error message, and details of a successful upload. 

A typical call could look something like this :

```s3upload("files/localfile.csv",  "amazonfiles/remotefile.csv", "text/csv", false, function(err, asset_location) { });```

Which would upload the text/csv file from ‘files/localfile.csv’ and attempt to put it on S3 at ‘amazonfiles/remotefile.csv’, NOT make it available to the public, and return any errors encountered in the ‘err’ param of the callback, and details of its success in the ‘asset_location’ param.

## api

Required ci-utils config for api. 

```"ci_utils": {
	"project": "[PROJECT NAME]",
	"api_request": {
		"host": "[URL TO SELF PROJECT e.g http://localhost]",
		"port": [PORT SELF PROJECT IS RUNNING ON e.g 3000]
	},
	"logger": {
		"host": "[URL TO LOGGER PROJECT e.g http://localhost]",
		"port": [PORT LOGGER PROJECT IS RUNNING ON e.g 1066]
	}
}```

As the api function also makes use of ci-utils logger function you will need to supply config for both.

The api function lets you call other endpoints from the same project. Say you’re running some code on CindyKate, and you need to make a GET /business call (also to CindyKate), then previously you’d have to handle this with some kind of api.internal style call, catch and validate any input/params/response and then also handle any associated API errors returned as a result.

Instead, you can pipe this request via the api function, and it will manage all that for you, even generating a /request/fail log via the logger.

It’s synchronous so will return the outcome of its attempt. It expects three or four parameters. A method (post, get, put or delete). An API endpoint URL. An **OPTIONAL** set of parameters (as expected for the API endpoint being called). And the callback, which returns **THREE** parameters rather than the more traditional two.

These returned parameters are hard errors from the underlying request library (i.e there’s a technical issue, the connection timed out, something crashed… etc.), errors from the API endpoint called (e.g params missing, invalid IDs used… etc.), and finally the response containing whatever the API endpoint returned.  

Any hard errors will already have been logged (and if appropriate) Slack’ed out for people to be made aware of. You don’t need to cater for handling this, just be aware of any error encountered.

A typical call might look like :

```var params = {
	name: 'Steve'
}

api_request('get', '/helloworld', params, function(err, api_err, data) {

  if (!_.isNull(err)) {
  	// Hard error - ci-utils will already have logged and alerted people to this!
  }
  
  if (!_.isNull(api_err)) {
  	// API error - maybe we missed a parameter out of our call?
  }

});```

So this makes a GET request to the /helloworld API endpoint, passing in the params required, and back come the two error objects and (in the event of success) response.
