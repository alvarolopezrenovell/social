'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var UserSchema = mongoose.Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String,
});

module.exports = mongoose.model('User', UserSchema);