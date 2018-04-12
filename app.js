/* eslint-disable no-console */
/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */
/* eslint no-unused-vars: ["error", { "args": "none" }] */
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID, MongoError } = require('mongodb'); // eslint-disable-line no-unused-vars

const app = express();

const corsOptions = {
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  origin: '*',
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Origin'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const articles = {}; // Create in memory storage of the articles

app.get('/articles', (request, response, next) => {
  response.send(Object.values(articles));
});

app.post('/articles/', (request, response, next) => {
  articles[request.params.id] = request.body;
  response.send(request.body);
});

app.delete('/articles/:id', (request, response, next) => {
  delete articles[request.params.id];
  response.sendStatus(200);
});

app.put('/articles/:id', (request, response, next) => {
  articles[request.params.id] = request.body;
  response.send(request.body);
});

// A very simple error handler. In a production setting you would
// not want to send information about the inner workings of your
// application or database to the client.
app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
  }
  // Here you could add code to refine your error code/message
  if (error instanceof MongoError && error.code === 11000) {
    response.sendStatus(400);
  } else {
    response.sendStatus(error.statusCode || error.status || 500);
  }
});

module.exports = {
  app,
  articles,
  setDb: (newDb) => { db = newDb; }, // eslint-disable-line no-undef
};
