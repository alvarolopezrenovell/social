'use strict'

// Requires
var fs = require('fs');
var path = require('path');
var Follow = require('../models/follow.js');
var User = require('../models/user.js');

// Methods

function create(req, res) {
    var params = req.body;

    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.id;

    Follow.findOne({user: follow.user, followed: follow.followed}, (err, followMatch) => {
        if (followMatch) {
            return res.status(200).send({follow: followMatch});
        } else {
            follow.save((err, followSaved) => {
                if (followSaved) {
                    return res.status(200).send({follow: follow});
                } else {
                    return res.status(200).send({message: 'Error on follow'});
                }
            });
        }
    });

}

function remove(req, res) {
    var userAuth = req.user.sub;
    var unfollow = req.params.id;

    Follow.findOne({user: userAuth, followed: unfollow}).remove(err => {
        return res.status(200).send({message: 'Unfollowed'});
    });
}

function list(req, res, where, populate) {

    var page = 1;
    if (req.query.page) {
        page = req.query.page;
    }

    var length = 5;

    Follow.find(where).populate(populate).paginate(page, length, (err, follows, total) => {
        getFollowingsAndFolloweds(req.user.sub).then((value) => {
            return res.status(200).send({
                follows: follows,
                users_following: value.following,
                users_followed: value.followed,
                total: total,
                pages: Math.ceil(total / length)
            });
        });

    });
}

function following(req, res) {
    var userId = req.user.sub;
    if (req.params.id) { userId = req.params.id; }

    var where = {user: userId};
    var populate = {path: 'followed'};
    return list(req, res, where, populate);
}

function followers(req, res) {
    var userId = req.user.sub;
    if (req.params.id) { userId = req.params.id; }

    var where = {followed: userId};
    var populate = {path: 'user'};
    return list(req, res, where, populate);
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

// Exports
module.exports = {
    create,
    remove,
    following,
    followers,
};