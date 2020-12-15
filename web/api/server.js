const { GraphQLServer } = require('graphql-yoga');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const path = require('path');
const AppId = require('ibmcloud-appid');
const log = require('cf-nodejs-logging-support');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const getAppIDConfig = require('./utils/appId');

const { WebAppStrategy } = AppId;

const { Query } = require('./graphql/resolvers');

const routes = require('./rest/routes');

const PORT = process.env.PORT || 4000;

log.setLoggingLevel('info');

const resolvers = {
  Query,
};

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: (request) => ({
    ...request,
  }),
});

server.express.use(helmet());

server.express.use(cors());
server.express.use(cookieParser('openeew'));
server.express.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
server.express.use(bodyParser.json());

server.express.use(log.logNetwork);

server.express.use(
  session({
    secret: 'openeew',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

server.express.use(passport.initialize());
server.express.use(passport.session());

const webAppStrategy = new WebAppStrategy(getAppIDConfig());
passport.use(webAppStrategy);

passport.serializeUser((user, done) => {
  console.log('user', user);
  return done(null, user);
});
passport.deserializeUser((obj, cb) => cb(null, obj));

server.express.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

server.express.post('/login', (req, res, next) => {
  req.logger.info(WebAppStrategy);
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user, info) => {
    if (err || info) {
      res.status(500).json({
        message: info.message,
      });
    } else {
      req.logIn(user, (e) => {
        if (e) {
          res.status(500).json({
            message: 'Error logging in. Contact admin.',
          });
        } else {
          res.status(200).json({
            username: user.email,
            name: user.name,
            fname: user.fname,
            lname: user.lname,
          });
        }
      });
    }
  })(req, res, next);
});

server.express.get('/isLoggedIn', (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  const result = {
    outcome: 'failure',
  };

  if (req.isAuthenticated()) {
    // retrieve more user profile attributes - seems to be currently empty
    // userProfileManager.getAllAttributes(req.session[WebAppStrategy.AUTH_CONTEXT].accessToken).then(function (attributes) {
    //    console.error("attributes: "+JSON.stringify(attributes));
    //   });
    result.outcome = 'success';
    result.username = req.user.username;
    result.email = req.user.email;
    result.name = req.user.name;
    result.fname = req.user.given_name;
    result.lname = req.user.family_name;
  }

  res.send(JSON.stringify(result, null, 3));
});

routes(server);

server.express.use(express.static(path.join(__dirname, './build')));

server.express.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});

// eslint-disable-next-line no-console
server.start(PORT, () => {
  log.info('Server is listening on port %d', PORT);
  console.log(`Server is running on ${PORT}`);
});
