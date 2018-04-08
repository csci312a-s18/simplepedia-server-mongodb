/* eslint-disable arrow-body-style, no-underscore-dangle */
const request = require('supertest');
const MongodbMemoryServer = require('mongodb-memory-server').default;
const { MongoClient } = require('mongodb');
const { app, setDb } = require('./app');

// Increase timeout for first run when downloading mongo binaries
jest.setTimeout(60000);

let mongoServer;
let db;

const article = {
  title: 'John P. Lucas',
  extract: 'Major General John Porter Lucas (January 14, 1890 – December 24, 1949) was a senior officer of the United States Army who saw service in World War I and World War II. He is most notable for being the commander of the U.S. VI Corps during the Battle of Anzio (Operation Shingle) in the Italian Campaign of World War II.',
  edited: '2016-11-19T22:57:32.639Z',
};

// Convert ObjectID type to string (as would occur in toJSON method)
const articleToJSON = function articleToJSON(localArticle) {
  return Object.assign({}, localArticle, { _id: localArticle._id.toHexString() });
};

beforeAll(() => {
  mongoServer = new MongodbMemoryServer();
  // By return a Promise, Jest won't proceed with tests until the Promise
  // resolves
  return mongoServer.getConnectionString().then((mongoURL) => {
    return Promise.all([
      MongoClient.connect(mongoURL),
      mongoServer.getDbName(),
    ]);
  }).then(([connection, dbName]) => {
    db = connection.db(dbName);
    setDb(db); // Set db in app.js
  }).then(() => {
    db.collection('articles').createIndex(
      { title: 1 },
      { unique: true },
    );
  });
});

afterAll(() => {
  mongoServer.stop();
});

describe('Simplepedia API', () => {
  beforeEach(() => {
    // By default insert adds the _id to the object, i.e. modifies article
    return db.collection('articles').insert(article);
  });

  afterEach(() => {
    return db.collection('articles').deleteMany({});
  });

  // SuperTest has several helpful methods for conveniently testing responses
  // that we can use to make the tests more concises

  test('GET /articles should return all movies (mostly SuperTest)', () => {
    return request(app).get('/articles')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect([articleToJSON(article)]);
  });

  describe('POST operations', () => {
    test('Should create new article', () => {
      const newArticle = { title: 'A new article', extract: 'Article body', edited: '2016-11-19T22:57:32.639Z' };
      return request(app).post('/articles').send(newArticle)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          // Use Jest matcher because we won't know the _id ahead of time, and
          // so only want to match the properties in newArticle
          expect(response.body).toMatchObject(newArticle);
        });
    });

    test('Should reject article with duplicate title', () => {
      return request(app).post('/articles').send(article)
        .expect(400);
    });

    test('Should reject article with no title', () => {
      return request(app).post('/articles').send({})
        .expect(400);
    });

    test('Should reject article with a null title', () => {
      return request(app).post('/articles').send({ title: null })
        .expect(400);
    });

    test('Should reject article with no edited time', () => {
      return request(app).post('/articles').send({ title: 'A title' })
        .expect(400);
    });

    test('Should create a default extract', () => {
      const newArticle = { title: 'A title', edited: '2016-11-19T22:57:32.639Z' };
      return request(app).post('/articles').send(newArticle)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          expect(response.body).toMatchObject(Object.assign({ extract: '' }, newArticle));
        });
    });
  });

  describe('DELETE operations', () => {
    test('Should delete article', () => {
      return request(app).delete(`/articles/${article._id}`)
        .expect(200)
        .then(() => {
          return request(app).get('/articles')
            .expect(200)
            .expect([]);
        });
    });
  });

  describe('PUT operations', () => {
    test('Should update article', () => {
      const newArticle = Object.assign({}, article, { extract: 'New extract' });
      return request(app).put(`/articles/${article._id}`).send(newArticle)
        .expect(200)
        .expect(articleToJSON(newArticle));
    });

    test('Should update article to id in URL', () => {
      const newArticle = Object.assign({}, article, { _id: 2, extract: 'New extract' });
      return request(app).put(`/articles/${article._id}`).send(newArticle)
        .expect(200)
        .expect(articleToJSON(Object.assign({}, article, { extract: 'New extract' })));
    });
  });
});
