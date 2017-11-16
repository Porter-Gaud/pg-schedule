var express = require('express'),
bodyParser = require('body-parser'),
methodOverride = require('method-override'),
port = process.env.PORT || 8080,
route = require('./app/routes/route.js'),
colors = require('colors'),
app = express(),
passport = require('passport'),
cookieParser = require('cookie-parser'),
GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
session = require('express-session'),
Sequelize = require('sequelize'),
fileUpload = require('express-fileupload'),
special = require('./app/model/special'),
fs = require('fs');

module.exports.DEVELOPMENT_USE_DATABASE = process.env.PG_USE_DATABASE_DEV;

app.set('view engine', 'jade');
app.set('views', './app/views');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileUpload());

if (process.env.PRODUCTION || process.env.PG_USE_DATABASE_DEV) {
  var sequelize = new Sequelize(process.env.PG_DATABASE_URL,
    {logging: false, ssl: true, dialectOptions: {ssl: true}});
  var User = sequelize.import(__dirname + '/app/model/User.js');

  var SequelizeStore = require('connect-session-sequelize')(session.Store);
  var sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 7 * 24 * 60 * 60 * 1000
  });

  require(__dirname + '/config/passport.js')(passport, GoogleStrategy, User);

  app.use(session({
    store: sessionStore,
    secret: process.env.PG_SESSION_KEY || 'this is a development secret key',
    resave: false,
    saveUninitialized: true,
  }));
  sessionStore.sync();
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use(methodOverride('X-HTTP-Method-Override'));

app.locals.production = (port == process.env.PORT);

app.use('/', express.static(__dirname + '/public/'));
app.use('/public', express.static(__dirname + '/bower_components/'));
app.use('/fonts', express.static(__dirname + '/bower_components/bootstrap/fonts/'));
app.use('/', route);
app.use('/', require('./app/routes/googleauth.js'));

app.use('/special', express.static(__dirname + '/uploads/'));
fs.readdir('./uploads/upper', function(err, files) {
  if (files) {
    files.forEach(function(file) {
      special.specialUpper.push(parseInt(file.split('.')[0]));
    });
  }
});
fs.readdir('./uploads/middle', function(err, files) {
  if (files) {
    files.forEach(function(file) {
      special.specialMiddle.push(parseInt(file.split('.')[0]));
    });
  }
});

app.listen(port, function() {
  console.log(colors.rainbow('Listening on port ' +  port));
});
