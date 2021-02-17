'use strict'

// Requires
var express = require('express');
var MessageController = require('../controllers/message.js');

// Middlewares
var mdAuthorization = require('../middlewares/authorization.js');

// Variables
var api = express.Router();


// Routes
api.get('/message/conversations', mdAuthorization.ensureAuth, MessageController.getConversations);
api.get('/message/conversation-info/:user_id', mdAuthorization.ensureAuth, MessageController.getConversationInfo);
api.get('/message/conversation/:user_id', mdAuthorization.ensureAuth, MessageController.getConversation);
api.get('/message/emitted', mdAuthorization.ensureAuth, MessageController.getEmitted);
api.get('/message/received', mdAuthorization.ensureAuth, MessageController.getReceived);
api.get('/message/unviewed', mdAuthorization.ensureAuth, MessageController.getUnviewed);
api.get('/message/set-viewed', mdAuthorization.ensureAuth, MessageController.setViewed);

api.post('/message', mdAuthorization.ensureAuth, MessageController.create);

// Exports
module.exports = api;