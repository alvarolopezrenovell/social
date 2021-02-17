'use strict'

// Requires

var fs = require('fs');
var path = require('path');
var moment = require('moment');

var Publication = require('../models/publication.js');
var User = require('../models/user.js');
var Follow = require('../models/follow.js');

// Methods

function create(req, res) {
    var params = req.body;

    if (params.text) {

        var publication = new Publication();
        publication.text = params.text;
        publication.file = null;
        publication.user = req.user.sub;
        publication.created_at = moment().unix();

        publication.save((err, publicationSaved) => {
            if (!err && publicationSaved) {
                res.status(200).send({publication: publicationSaved});
            } else {
                res.status(200).send({message: 'Error on save'});
            }
        });
    } else {
        res.status(200).send({
            message: 'Error in parameters'
        });
    }
}

function list(req, res) {
    var publicationId = req.params.id;

    if (publicationId != null) {
        Publication.findById(publicationId, (err, publication) => {
            if (publication) {
                res.status(200).send({publication: publication});
            } else {
                res.status(404).send({message: 'Publication not found'});
            }
        });
    } else {
        var userAuthId = req.user.sub;

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        var length = 10;

        Follow.find({user: userAuthId}).populate('followed').exec((err, follows) => {
            var usersFollowing = [];

            follows.forEach((follow) => {
                usersFollowing.push(follow.followed);
            });

            usersFollowing.push(userAuthId);

            Publication.find({user: {'$in': usersFollowing}})
                .sort('-created_at')
                .populate('user')
                .paginate(page, length, (err, publications, total) => {
                    res.status(200).send({
                        publications: publications,
                        total: total,
                        pages: Math.ceil(total / length),
                        per_page: length
                    });
                });
        });
    }
}

function listByUser(req, res) {
    var userId = req.user.sub;

    if (req.params.user_id) {
        userId = req.params.user_id;
    }

    var page = 1;
    if (req.query.page) {
        page = req.query.page;
    }

    var length = 10;

    Publication.find({user: userId})
        .sort('-created_at')
        .populate('user')
        .paginate(page, length, (err, publications, total) => {
            res.status(200).send({
                publications: publications,
                total: total,
                pages: Math.ceil(total / length),
                per_page: length
            });
        });
}

function remove(req, res) {
    var userAuthId = req.user.sub;
    var publicationId = req.params.id;

    Publication.findOne({'_id': publicationId, user: userAuthId}).exec((err, publicationStored) => {
        if (publicationStored) {
            publicationStored.remove(err => {
                return res.status(200).send({message: 'Deleted'});
            });
        } else {
            return res.status(404).send({message: 'Publication not found'});
        }
    });
}

function uploadFile(req, res) {
    var publicationId = req.params.id;

    if (req.files && req.files.file && req.files.file.path) {
        var filePath = req.files.file.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit.pop();
        var fileExtension = fileName.split('.').pop();
        var aceptedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

        if (aceptedExtensions.indexOf(fileExtension) != -1) {

            Publication.findById(publicationId, (err, publicationStored) => {
                if (publicationStored) {
                    if (publicationStored.user != req.user.sub) {
                        fs.unlink(filePath, (err) => {});
                        return res.status(200).send({message: 'Permission denied'});
                    }

                    Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdated) => {
                        if (publicationUpdated) {
                            return res.status(200).send({publication: publicationUpdated});
                        } else {
                            return res.status(200).send({message: 'Error on update file'});
                        }
                    });
                } else {
                    fs.unlink(filePath, (err) => {});
                    return res.status(200).send({message: 'Publication not found'});
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

function getFile(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (publication) {
            var filePath = './uploads/publications/'+publication.file;

            fs.exists(filePath, (exists) => {
                if (exists) {
                    res.sendFile(path.resolve(filePath));
                } else {
                    res.status(200).send({message: 'File not found'});
                }
            });
        } else {
            return res.status(200).send({message: 'Publication file not found'});
        }
    });
}

// Exports

module.exports = {
    create,
    list,
    listByUser,
    remove,
    uploadFile,
    getFile,
};