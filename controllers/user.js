'use strict'

// Requires

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt.js');
var fs = require('fs');
var path = require('path');
var User = require('../models/user.js');
var Follow = require('../models/follow.js');
var Publication = require('../models/publication.js');

// Methods

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (user) {
            user.password = undefined;
            return res.status(200).send({
                user: user,
            });
        } else {
            return res.status(404).send({message: 'User id not found'});
        }
    });
}

function list(req, res) {
    var userId = req.params.id;

    if (userId != null) {
        User.findById(userId, (err, user) => {
            if (user) {
                user.password = undefined;
                getFollowInfo(req.user.sub, user.id).then((info) => {
                    return res.status(200).send({
                        user: user,
                        following: info.following,
                        followed: info.followed,
                    });
                });
            } else {
                return res.status(404).send({message: 'User id not found'});
            }
        });
    } else {
        var userAuth = req.user.sub;

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        var length = 8;

        User.find().sort('_id').paginate(page, length, (err, users, total) => {
            getFollowingsAndFolloweds(userAuth).then((value) => {
                return res.status(200).send({
                    users: users,
                    users_following: value.following,
                    users_followed: value.followed,
                    total: total,
                    pages: Math.ceil(total / length)
                });
            });
        });
    }
}

function getCounters(req, res) {
    var userId = req.user.sub;

    if (req.params.id) {
        userId = req.params.id;
    }

    getCountersData(userId).then((value) => {
        return res.status(200).send(value);
    })
}

function update(req, res) {
    var userId = req.params.id;
    var update = req.body;

    // No se permite actualizar la contraseña
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(200).send({message: 'Permission denied'});
    }

    User.find({
        $or: [
            {email: update.email.toLowerCase()},
            {nick: update.nick}
        ],
    }).exec((err, users) => {
        let userDuplicated = false;
        users.forEach((user) => {
            if (user && user._id != userId) userDuplicated = true;
        });

        if (userDuplicated) return res.status(200).send({message: 'El email o el nick ya están en uso'});

        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
            if (userUpdated) {
                userUpdated.password = undefined;
                return res.status(200).send({user: userUpdated});
            } else {
                return res.status(200).send({message: 'Error on update user'});
            }
        });
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;

    if (req.files && req.files.image && req.files.image.path) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit.pop();
        var fileExtension = fileName.split('.').pop();
        var aceptedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

        if (userId != req.user.sub) {
            fs.unlink(filePath, (err) => {});
            return res.status(200).send({message: 'Permission denied'});
        }

        if (aceptedExtensions.indexOf(fileExtension) != -1) {
            User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated) => {
                if (userUpdated) {
                    userUpdated.password = undefined;
                    return res.status(200).send({user: userUpdated});
                } else {
                    return res.status(200).send({message: 'Error on update image'});
                }
            });
        } else {
            fs.unlink(filePath, (err) => {});
            return res.status(200).send({message: 'File extension not valid'});
        }
    } else {
        return res.status(200).send({message: 'File not found'});
    }
}

function getImage(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (user) {
            var filePath = './uploads/users/'+user.image;

            fs.exists(filePath, (exists) => {
                if (exists) {
                    res.sendFile(path.resolve(filePath));
                } else {
                    res.status(200).send({message: 'File not found'});
                }
            });
        } else {
            return res.status(200).send({message: 'User id not found'});
        }
    });
}

function login(req, res) {
    var params = req.body;

    var email = params.email.toLowerCase();
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    user.password = undefined;
                    return res.status(200).send({
                        user: user,
                        token: jwt.createToken(user)
                    });
                } else {
                    return res.status(200).send({message: 'User password not valid'});
                }
            });
        } else {
            return res.status(200).send({message: 'User email not found'});
        }
    });
}

function register(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.nick &&
        params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email.toLowerCase();
        user.role = 'ROLE_USER';
        user.image = null;

        User.find({
            $or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick}
            ],
        }).exec((err, users) => {
            if (users && users.length > 0) {
                res.status(200).send({message: 'El email o el nick ya están en uso'});
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userSaved) => {
                        if (!err && userSaved) {
                            userSaved.password = undefined;
                            res.status(200).send({user: userSaved});
                        } else {
                            res.status(200).send({message: 'Error on save'});
                        }
                    });
                });
            }
        });

    } else {
        res.status(200).send({
            message: 'Error in parameters'
        });
    }
}

// Methods (private)

async function getFollowInfo(userId, followedId) {
    var following = await Follow.findOne({user: userId, followed: followedId}).exec().then((follow) => {
        return follow;
    });
    var followed = await Follow.findOne({user: followedId, followed: userId}).exec().then((follow) => {
        return follow;
    });

    return {
        following: following,
        followed: followed,
    };
}

async function getFollowingsAndFolloweds(userId) {

    var followingIds = [];
    var following = await Follow.find({user: userId}).select({'_id': 0, '__v': 0, 'user': 0}).exec().then((follows) => {
        return follows;
    });
    following.forEach((follow) => {
        followingIds.push(follow.followed);
    });

    var followedIds = [];
    var followed = await Follow.find({followed: userId}).select({'_id': 0, '__v': 0, 'followed': 0}).exec().then((follows) => {
        return follows;
    });
    followed.forEach((follow) => {
        followedIds.push(follow.user);
    });

    return {
        following: followingIds,
        followed: followedIds,
    };
}

async function getCountersData(userId) {
    var followingCount = await Follow.count({user: userId}).exec().then((count) => {
        return count;
    });

    var followedCount = await Follow.count({followed: userId}).exec().then((count) => {
        return count;
    });

    var publicationsCount = await Publication.count({user: userId}).exec().then((count) => {
        return count;
    });

    return {
        following: followingCount,
        followed: followedCount,
        publications: publicationsCount,
    };
}

// Exports

module.exports = {
    getUser,
    list,
    getCounters,
    update,
    uploadImage,
    getImage,
    login,
    register
};