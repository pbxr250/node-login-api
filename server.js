require('rootpath')();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));



//Mylogger
app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/users', require('./users/users.controller'));

app.use('/login', (req, res, next) => {
    //req.url = path.basename(req.originalUrl);
    req.originalUrl = req.baseUrl = req.path = '/';
    express.static(__dirname + '/frontend/vue-login-example/dist/')(req, res, next);
});

app.use('/register', (req, res, next) => {
    req.originalUrl = req.baseUrl = req.path = '/';
    express.static(__dirname + '/frontend/vue-login-example/dist/')(req, res, next);
});

app.use(express.static(__dirname + '/frontend/vue-login-example/dist/'));

// app.get('/', (req, res) => {
//     const fileDirectory = path.resolve(__dirname, '.', 'frontend/vue-login-example/dist/');
//     res.sendFile('index.html', {root: fileDirectory}, (err) => {
//       res.end();
//       if (err) throw(err);
//     });
// });

// global error handler
app.use(errorHandler);



// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
