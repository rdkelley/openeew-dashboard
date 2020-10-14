const { GraphQLServer } = require('graphql-yoga');
const { Query, initRESTEndpoints } = require('./resolvers');
const path = require('path');
const express = require('express');
const Sequelize = require('sequelize');
const keys = require('./keys');

const PORT = process.env.PORT || 4000;

const sequelize = new Sequelize(keys.pgDatabase, keys.pgUser, keys.pgPassword, {
  host: keys.pgHost,
  dialect: 'postgres',
  protocol: 'postgres',
  port: keys.pgPort,
});

const resolvers = {
  Query,
};

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: (request) => {
    return {
      ...request,
    };
  },
});

server.express.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

server.express.use(express.static(path.join(__dirname, '../client/build')));

server.express.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

initRESTEndpoints(server);

function connect() {
  console.log('connect run');

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);

      setTimeout(() => {
        connect();
      }, 10000);
    });
}

setTimeout(connect, 10000);

server.start(PORT, () => console.log(`OpenEEW Dashboard server is running.`));
