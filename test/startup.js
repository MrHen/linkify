var async = require('async');
var aws = require('aws-sdk');
let chai = require('chai');

let expect = chai.expect;
chai.use(require('dirty-chai'));

var config = require('../lib/config');
var app = require('../lib/app');

before(function (done) {
  this.timeout(10000);
  async.auto({
    'app': (cb) => app(cb),
    'table': (cb) => createTable(cb)
  }, done);
});

// TODO
// after(function(done) {
//   deleteTable(done);
// });

function createTable(callback) {
  dynamodb = new aws.DynamoDB();
  
  var params = {
    AttributeDefinitions: [
      {
        AttributeName: 'LinkId',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'LinkId',
        KeyType: 'HASH'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: config.get('DYNAMODB_TABLE')
  };
  dynamodb.createTable(params, (err, result) => {
    if (err && err.code !== "ResourceInUseException") {
      return callback(err);
    }

    var params = {
      TableName: config.get('DYNAMODB_TABLE')
    };
    dynamodb.waitFor('tableExists', params, callback);
  });
}

function deleteTable(callback) {
  var params = {
    TableName: config.get('DYNAMODB_TABLE')
  };
  dynamodb.deleteTable(params, callback);
}
