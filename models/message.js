'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var MessageSchema = mongoose.Schema({
    text: String,
    viewed: Boolean,
    created_at: String,
    emitter: {type: mongoose.Schema.ObjectId, ref: 'User'},
    receiver: {type: mongoose.Schema.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Message', MessageSchema);