'use strict'

// Requires

var express = require('express');
var UserController = require('../controllers/user.js');
var multipart = require('connect-multiparty');

// Middlewares

var mdAuthorization = require('../middlewares/authorization.js');
var mdUpload = multipart({uploadDir: './uploads/users'});

// Variables

var api = express.Router();

// Routes

api.get('/list/:id?', mdAuthorization.ensureAuth, UserController.list);
api.get('/:id', mdAuthorization.ensureAuth, UserController.getUser);
api.get('/get-image/:id', UserController.getImage);
api.get('/counters/:id?', mdAuthorization.ensureAuth, UserController.getCounters);

api.put('/update/:id', mdAuthorization.ensureAuth, UserController.update);

api.post('/login', UserController.login);
api.post('/register', UserController.register);
api.post('/upload-image/:id', [mdAuthorization.ensureAuth, mdUpload], UserController.uploadImage);

// Exports

module.exports = api;