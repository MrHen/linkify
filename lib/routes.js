var express = require('express');
var path = require('path');
var router = express.Router();

var links = require('./links');

// Logging / utility route
router.use('/', (req, res, next) => {
  console.log(`start ${req.method} ${req.url}`);
  next();
});

// Healthcheck to let monitors know server is up
router.get('/healthcheck', (req, res, next) => {
  res.status(200).send({
    message: 'healthcheck'
  });
});

// Create new link
router.post('/links', (req, res, next) => {
  links.generateLink({
    url: req.body.url
  }, (err, link) => {
    if (err) {
      return next(err);
    }

    res.status(201).send(link);
  });
});

// Resolve link -- should be given a fancy short domain like https://lin.ks/:linkId
router.get('/links/:linkId', (req, res, next) => {
  links.getLink({
    linkId: req.params.linkId
  }, (err, link) => {
    if (err) {
      return next(err);
    }

    // TODO handle HTML redirect if configured to do so
    res.redirect(302, link.url);
  });
});

// Fall through to error handler
router.use('/', (err, req, res, next) => {
  var status = err.statusCode || err.status || 500;
  var message = err.message || err.error || 'ERROR_UNKNOWN';
  res.status(status);
  res.send({
    message: message,
    error: err
  });

  console.log('ERROR', err);
});

// Reject all other routes
router.use('/', (req, res, next) => {
  console.log(`404 ${req.method} ${req.url}`);

  var status = 404;
  var message = 'ERROR_ROUTE_NOT_FOUND';
  res.status(status);
  res.send({
    message: message
  });
});

module.exports = router;
