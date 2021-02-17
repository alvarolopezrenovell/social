'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

// Vars
var app = express();

// Load routes
var userRoutes = require('./routes/user.js');
var followRoutes = require('./routes/follow.js');
var publicationRoutes = require('./routes/publication.js');
var messageRoutes = require('./routes/message.js');

// Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});


// Routes
app.use('/api/user', userRoutes);
app.use('/api/user', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

// Exports
module.exports = app;
