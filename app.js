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

let db; // MongoDB client

app.get('/articles', (request, response, next) => {
  db.collection('articles').find().toArray().then((documents) => {
    response.send(documents);
  }, next); // <- Notice the "next" function and catch handler
});

app.post('/articles', (request, response, next) => {
  const newArticle = Object.assign({ extract: '' }, request.body);
  if (!newArticle.edited) {
    response.sendStatus(400);
    return;
  }
  db.collection('articles').insertOne(newArticle).then((result) => {
    response.send(result.ops[0]);
  }, next);
});

app.delete('/articles/:id', (request, response, next) => {
  db.collection('articles')
    .deleteOne({ _id: ObjectID.createFromHexString(request.params.id) })
    .then(() => {
      response.sendStatus(200);
    }, next);
});

app.put('/articles/:id', (request, response, next) => {
  const updatedArticle = Object.assign(
    { extract: '' },
    request.body,
    { _id: ObjectID.createFromHexString(request.params.id) },
  );
  db.collection('articles')
    .findOneAndUpdate(
      { _id: updatedArticle._id },
      { $set: updatedArticle },
      { returnOriginal: false },
    )
    .then((result) => {
      response.send(result.value);
    }, next);
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
  setDb: (newDb) => { db = newDb; }, // eslint-disable-line no-undef
};
