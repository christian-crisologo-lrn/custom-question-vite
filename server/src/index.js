const http = require('http');
const express = require('express');
const cors = require('cors');
const Learnosity = require('learnosity-sdk-nodejs');
const {
  getPort,
  getServerUrl,
  getLearnosityCredentials,
  getLearnosityDomain,
  getCorsOptions,
} = require('./config');

const app = express();

app.use(cors(getCorsOptions()));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/sign-learnosity-request', (req, res) => {
  const learnositySdk = new Learnosity();
  const credentials = getLearnosityCredentials();
  const domain = getLearnosityDomain();

  const response = learnositySdk.init(
    'items',
    {
      consumer_key: credentials.consumerKey,
      domain: domain,
    },
    credentials.secret,
    req.body
  );

  console.log('Received request with session ID', req.body.session_id);

  res.send(response);
});

const requestedPort = getPort();
const serverUrl = getServerUrl();

function startServer(port) {
  const server = http.createServer(app);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, retrying on ${nextPort}`);
      startServer(nextPort);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    process.env.PORT = String(port);
    console.log(`Server listening at http://localhost:${port}`);
  });
}

startServer(requestedPort);
