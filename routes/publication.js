'use strict'

// Requires
var express = require('express');
var PublicationController = require('../controllers/publication.js');
var multipart = require('connect-multiparty');

// Middlewares
var mdAuthorization = require('../middlewares/authorization.js');
var mdUpload = multipart({uploadDir: './uploads/publications'});

// Variables
var api = express.Router();

// Routes
api.get('/publication/user/:user_id', mdAuthorization.ensureAuth, PublicationController.listByUser);
api.get('/publication/:id?', mdAuthorization.ensureAuth, PublicationController.list);
api.get('/publication/get-file/:id', PublicationController.getFile);

api.post('/publication', mdAuthorization.ensureAuth, PublicationController.create);
api.post('/publication/upload-file/:id', [mdAuthorization.ensureAuth, mdUpload], PublicationController.uploadFile);

api.delete('/publication/:id', mdAuthorization.ensureAuth, PublicationController.remove);

// Exports
module.exports = api;