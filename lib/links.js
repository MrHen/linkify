var _ = require('lodash');
var async = require('async');
var aws = require('aws-sdk');

var config = require('./config');

var dynamodb; // lazy load AWS services

var link = {
  generateLink: generateLink,
  generateId: generateId,
  generateUniqueId: generateUniqueId,
  getLink: getLink,
  putLink: putLink
};

module.exports = link;

// Create random id from approved chars
// TODO put some of this stuff in the config
function generateId(options) {
  options = options || {};
  var idLength = options.idLength || 6;
  var chars = options.chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return _.take(_.shuffle(chars), idLength).join('');
}

// Create a random id that hasn't been used before
function generateUniqueId(options, callback) {
  options = options || {};
  var maxTries = options.maxTries || 3;

  var linkId = options.linkId;
  var tries = 0;
  async.doUntil(
    (cb) => {
      tries++;
      linkId = linkId || link.generateId();
      link.getLink({ linkId: linkId }, (err, res) => {
        if (err) {
          return cb(err);
        }

        // If link already exists, ignore this id
        if (res) {
          linkId = null;
        }
        cb();
      });
    },
    () => {
      // Stop if we find an unused linkId or we exceed maximum tries
      return linkId || tries > maxTries;
    },
    (err) => {
      if (err) {
        return callback(err);
      }
      // TODO increase id length by 1 for each failure and this basically won't happen
      if (!linkId) {
        return callback(new Error('Could not find unique id'));
      }
      callback(null, linkId);
    }
  );
}

// Create new link for given url
function generateLink(options, callback) {
  dynamodb = dynamodb || new aws.DynamoDB.DocumentClient();

  options = options || {};
  var record = {
    linkId: options.linkId,
    url: options.url
  };
  async.auto({
    'id': (cb) => generateUniqueId(record, cb),
    'create': ['id', (results, cb) => {
      record.linkId = results.id;
      link.putLink(record, cb);
    }]
  }, (err, results) => {
    if (err) {
      return callback(err);
    }

    callback(null, record);
  });
}

// Retrieve link information for given id
function getLink(options, callback) {
  dynamodb = dynamodb || new aws.DynamoDB.DocumentClient();
  var params = {
    TableName : options.table || config.get('DYNAMODB_TABLE'),
    Key: {
      LinkId: options.linkId
    }
  };

  dynamodb.get(params, (err, res) => {
    if (err) {
      return callback(err);
    }

    var record = null;

    if (res.Item) {
      record = {
        linkId: res.Item.LinkId,
        url: res.Item.Url
      };
    }

    callback(null, record);
  });
}

// Save record to database (use generateLink in route)
function putLink(options, callback) {
  dynamodb = dynamodb || new aws.DynamoDB.DocumentClient();
  var params = {
    TableName : options.table || config.get('DYNAMODB_TABLE'),
    Item: {
      LinkId: options.linkId,
      Url: options.url
    }
  };
 
  dynamodb.put(params, (err, res) => {
    if (err) {
      return callback(err);
    }

    callback(null, res.Attributes);
  });
}
