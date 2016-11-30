var express = require('express');
var hbs = require('hbs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);
var config = require('config');
var dbConfig = config.get('dbConfig');
var options = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: 'ldso',
    password: 'mypass',
    database: dbConfig.database
};
var sessionStore = new MySQLStore(options);

var auth = require('./routes/auth');
var template = require('./routes/template');
var api = require('./routes/api');
var user = require('./routes/user');
var notification = require('./routes/notification');
var history = require('./routes/history');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1); // trust first proxy

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 18000000
    }
}));

app.use('/', auth);
app.use('/api', api);
app.use(function (req, res, next) {
    if (req.session.id && req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
});

app.use('/template', template);
app.use('/user', user);
app.use('/notification', notification);
app.use('/history', history);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
