var app = require('./lib/app');

app((err, running) => {
  if (err) {
    console.log('App error on start', err);
  } else {
    console.log('App started');
  }
});
