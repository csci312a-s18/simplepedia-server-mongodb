/* eslint-disable no-console */
const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');
const { app, setDb } = require('./app');

const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:5000/simplepedia';

MongoClient.connect(mongoURL, (err, database) => {
  if (err) {
    console.error(err);
  } else {
    // Don't start server unless we have successfully connect to the database
    setDb(database.db(url.parse(mongoURL).pathname.slice(1))); // Extract database name

    // We create the server explicitly (instead of using app.listen()) to
    // provide an example of how we would create a https server
    const server = http.createServer(app).listen(process.env.PORT || 3001);
    console.log('Listening on port %d', server.address().port);
  }
});
