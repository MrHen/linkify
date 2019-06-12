var async = require('async');
var bodyParser = require('body-parser');
var config = require('./config');
var express = require('express');
var overrideContentType = require('./overrideContentType');

module.exports = (callback) => {
  async.auto({
    'app': (cb) => {
      var app = express();

      app.use(overrideContentType());
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));

      cb(null, app);
    },
    'routes': ['app', (results, cb) => {
      results.app.use('/', require('./routes'));
      cb();
    }],
    'server': ['app', 'routes', (results, cb) => {
      var host = config.get('EXPRESS_HOST');
      var port = config.get('EXPRESS_PORT');
      var server = results.app.listen(port, host, (err) => {
        cb(err, server);
      });
    }]
  }, (err, results) => {
    if (err) {
      return callback(err);
    }

    // Save server instance for later in case we need to shutdown or restart
    results.app.server = results.server;

    var address = results.app.server.address();
    console.log(`listening on: ${address.address}:${address.port}`);

    callback(err, results.app);
  });
};
