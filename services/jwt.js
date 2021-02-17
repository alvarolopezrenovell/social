'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';

function createToken(user) {
  var payLoad = {
      sub: user._id,
      name: user.name,
      surname: user.surname,
      nick: user.nick,
      email: user.email,
      role: user.role,
      image: user.image,
      iat: moment().unix(),
      exp: moment().add(30, 'days').unix()
  };

  return jwt.encode(payLoad, secret);
}

module.exports = {
    createToken,
    secret
};