'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-pagination');

var PublicationSchema = mongoose.Schema({
    text: String,
    file: String,
    user: {type: mongoose.Schema.ObjectId, ref: 'User'},
    created_at: String,
});

module.exports = mongoose.model('Publication', PublicationSchema);