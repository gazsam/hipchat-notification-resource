// (c) Copyright 2016 Hewlett Packard Enterprise Development LP
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var request = require('request');

function NGALMClient() {
  this.sourceProperties = [
    {
      name: "ngalm_url",
      optional: false
    },
    {
      name: "client_id",
      optional: false
    },
    {
      name: "client_secret",
      optional: false
    }
  ];
  this.paramProperties = [
    {
      name: "color",
      optional: true
    },
    {
      name: "from",
      optional: false
    },
    {
      name: "message",
      optional: false
    },
    {
      name: "message_format",
      optional: true
    },
    {
      name: "notify",
      optional: true
    }
  ];
  this.validInput = true;
  this.failOnError = true;
}

NGALMClient.prototype.checkArgument = function (argumentName, argumentValue) {
  if (!argumentValue || argumentValue.length === 0) {
    console.error("Please provide a value for", argumentName);
    this.validInput = false;
  }
};

NGALMClient.prototype.connectALM = function (source, params, done) {
  var requestUrl = `${source.ngalm_url}/authentication/sign_in`,
    authBody = {
      client_id: source.client_id,
      client_secret: source.client_secret,
    },
    requestOptions = {
      url: requestUrl,
      method: "POST",
      json: authBody
    };

  // if (params.color) {
  //   hipChatMessage.color = params.color;
  // }

  // if (params.message_format) {
  //   hipChatMessage.message_format = params.message_format;
  // }

  // if (params.notify) {
  //   hipChatMessage.notify = params.notify;
  // }

  request(requestOptions, (err, response) => {
    if (err || response.statusCode > 200) {
      return done(err || response.body)
    }

    return done(err);
  });
};

NGALMClient.prototype.checkProperties = function (values, properties) {
  for (property of properties) {
    if (!property.optional) {
      this.checkArgument(property.name, values[property.name]);
    }
  }
};


NGALMClient.prototype.connect = function (source, params) {
  var self = this;
  if (source.fail_on_error === undefined) {
    source.fail_on_error = true;
  }

  self.failOnError = source.fail_on_error;
  self.validInput = true;

  self.checkProperties(source, this.sourceProperties);
  self.checkProperties(params, this.paramProperties);

  if (!self.validInput) {
    console.error("Please provide valid input and try again");
    return process.exit(1);
  }

  self.connectALM(source, params, (error, result) => {
    if (error) {
      console.error(`Error sending notification. Fail on error: ${self.failOnError}`);
      console.error(error);
      if (self.failOnError) {
        process.exit(1);
      }
    }

    // Concourse expects this output from stdout, do not use console.dir
    console.log(JSON.stringify({
      version: {
        ref: "none"
      }
    }));
    process.exit(0);
  });
}

module.exports = NGALMClient;