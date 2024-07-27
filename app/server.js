let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

const DB_USER = process.env.MONGO_DB_USERNAME;
const DB_PASS = process.env.MONGO_DB_PWD;
let mongoClient = null;
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

// when starting app locally, use "mongodb://admin:password@localhost:27017" URL instead
let mongoUrlDockerCompose = `mongodb://${DB_USER}:${DB_PASS}@mongodb`;

// the following db and collection will be created on first connect
let databaseName = "my-db";
let collectionName = "my-collection";
 
app.get('/fetch-data', async function (req, res) {
  let response = {};
  let db = mongoClient.db(databaseName);
  let myquery = { myid: 1 };
  let result = null;
  try {
    result = await db.collection(collectionName).findOne(myquery);
    response = result;
  } catch (err) {
    console.error('failed to findOne', err);
  } finally {
    res.send(response? response: {});
  }
});
let server = app.listen(3000, async function () {
  try {
    mongoClient = await MongoClient.connect(mongoUrlDockerCompose);
    console.log("app listening on port 3000!");
  } catch (err) {
    console.error(`failed to connect to ${mongoUrlDockerCompose}`, err)
    throw err;
  }
});
function gracefulShutdown() {
  console.log('Shutting down gracefully');
  server.close((err) => {
    if (err != null) {
      console.error('failed to close', err);
      return err
    }
    mongoClient.close().then(() => {
      console.log('Server closed');
      process.exit(0);
    }).catch(err => {
      console.error('failed to close mongo connection', err);
    })
  })
  // Force close after 5 seconds
  setTimeout(() =>{
    console.error('Couldn`t close in time, force to close');
    process.exit(1);
  }, 5000);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);