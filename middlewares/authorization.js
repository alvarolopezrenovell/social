'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var jwtService = require('../services/jwt.js');

var secret = jwtService.secret;

function ensureAuth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({message: 'Authorization in headers not found'});
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payLoad = jwt.decode(token, secret);
        if (payLoad.exp <= moment.unix()) {
            return res.status(401).send({message: 'Token has expired'});
        }
    } catch(e) {
        return res.status(200).send({message: 'Token is not valid'});
    }

    req.user = payLoad;

    next();
}

module.exports = {
    ensureAuth
};