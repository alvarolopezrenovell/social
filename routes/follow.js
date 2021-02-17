'use strict'

// Requires
var express = require('express');
var FollowController = require('../controllers/follow.js');
var mdAuthorization = require('../middlewares/authorization.js');

// Vars
var api = express.Router();

// Routes
api.get('/following/:id?', mdAuthorization.ensureAuth, FollowController.following);
api.get('/followers/:id?', mdAuthorization.ensureAuth, FollowController.followers);

api.post('/follow', mdAuthorization.ensureAuth, FollowController.create);

api.delete('/follow/:id', mdAuthorization.ensureAuth, FollowController.remove);

// Exports
module.exports = api;