'use strict'

// Requires

var moment = require('moment');

var Message = require('../models/message.js');
var User = require('../models/user.js');
var Follow = require('../models/follow.js');

// Methods

function create(req, res) {
    var params = req.body;

    if (params.text && params.receiver) {

        var message = new Message();
        message.text = params.text;
        message.viewed = false;
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.created_at = moment().unix();

        message.save((err, messageSaved) => {
            if (!err && messageSaved) {
                res.status(200).send({message: messageSaved});
            } else {
                res.status(200).send({message: 'Error on save'});
            }
        });
    } else {
        res.status(200).send({message: 'Error in parameters'});
    }
}

function list(req, res, where) {

    var page = 1;
    var length = 4;

    if (req.query.page) {
        page = parseInt(req.query.page);
    }

    if (req.query.length) {
        length = parseInt(req.query.length);
    }


    Message.find(where)
        .populate({ path: 'emitter receiver' })
        .sort({ _id: -1 })
        .paginate(page, length, (err, messages, total) => {
            return res.status(200).send({
                messages: messages,
                total: total,
                pages: Math.ceil(total / length)
            });
        });
}

function getConversations(req, res) {

}

function getConversation(req, res) {
    var userAuthId = req.user.sub;
    var userId = req.params.user_id;

    var where = {
        $or: [
            { emitter: userAuthId, receiver: userId },
            { emitter: userId, receiver: userAuthId }
        ]
    };

    return list(req, res, where);
}

function getConversationInfo(req, res) {
    var userAuthId = req.user.sub;
    var userId = req.params.user_id;

    var where = {
        $or: [
            { emitter: userAuthId, receiver: userId },
            { emitter: userId, receiver: userAuthId }
        ]
    };

    Message.find(where)
        .sort({_id: -1})
        .limit(1)
        .then(messages => {
            Message.count({receiver: userAuthId, emitter: userId, viewed: false}).exec((err, count) => {
                return res.status(200).send({
                    last_message: messages.length > 0 ? messages[0] : null,
                    num_messages_unviewed: count
                });
            });

        });
}

function getEmitted(req, res) {
    var userAuthId = req.user.sub;
    var where = {emitter: userAuthId};
    return list(req, res, where);
}

function getReceived(req, res) {
    var userAuthId = req.user.sub;
    var where = {receiver: userAuthId};
    return list(req, res, where);
}

function getUnviewed(req, res) {
    var userAuthId = req.user.sub;

    Message.count({receiver: userAuthId, viewed: false}).exec((err, count) => {
        return res.status(200).send({unviewed: count});
    });
}

function setViewed(req, res) {
    var userAuthId = req.user.sub;

    Message.update({receiver: userAuthId, viewed: false}, {viewed: true}, {"multi": true}, (err, result) => {
        return res.status(200).send({result: result});
    });
}

// Exports

module.exports = {
    create,
    getConversations,
    getConversation,
    getConversationInfo,
    getReceived,
    getEmitted,
    getUnviewed,
    setViewed,
};