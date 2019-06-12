var _ = require('lodash');
var aws = require('aws-sdk');
var nconf = require('nconf');

nconf
  .argv()
  .env()
  .defaults({
    'DYNAMODB_TABLE': 'links',
    'EXPRESS_HOST': 'localhost',
    'EXPRESS_PORT': 8080
  });

// Set up dynamodb-local
if (nconf.get('DYNAMODB_ENDPOINT')) {
  var endpoint = new aws.Endpoint(nconf.get('DYNAMODB_ENDPOINT'));
  _.set(aws, 'config.dynamodb.endpoint', endpoint);
}

module.exports = nconf;
