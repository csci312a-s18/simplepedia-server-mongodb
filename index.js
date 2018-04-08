/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { app, articles } = require('./app');

fs.readFile(path.join(__dirname, 'seed.json'), (err, contents) => {
  const data = JSON.parse(contents);
  data.forEach((article, index) => {
    articles[index + 1] = Object.assign({ _id: index + 1 }, article);
  });

  const server = http.createServer(app).listen(process.env.PORT || 3001);
  console.log('Listening on port %d', server.address().port);
});
