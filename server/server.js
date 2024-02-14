const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas/typedefs');
const resolvers = require('./schemas/resolvers');
const { authMiddleware } = require('./utils/auth');

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.static(path.join(__dirname, '../client/dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use((req, res, next) => {
    authMiddleware({ req, res }); 
    next();
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({ app });

  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
};

startServer().catch(err => console.error(err));