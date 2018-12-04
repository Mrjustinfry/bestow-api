'use strict';

const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
//const ObjectID = require('mongodb').ObjectID;

const { Users, Items } = require("./models");

//User post request
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 5,
            max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField]
                    .min} characters long`
                : `Must be at most ${sizedFields[tooLargeField]
                    .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { username, password, firstName = '', lastName = '' } = req.body;
      firstName = firstName.trim();
      lastName = lastName.trim();

    return Users.find({ username })
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return Users.hashPassword(password);
        })
        .then(hash => {
            return Users.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal server error' });
        });
});

//User get request
router.get('/', (req, res) => {
  return Users.find()
      .then(users => res.json(users.map(user => user.serialize())))
      .catch(err => res.status(500).json({ message: 'Internal server error' }));
})

//User get requests by ID
router.get('/:id', (req,res) => {
  Users
     .findById(req.params.id)
     .then(user => {
         res.json({
             userId: user._id,
             firstName: user.firstName,
             lastName: user.lastName,
             username: user.username,
         });
     })
     .catch(err => {
         console.log(err);
         res.status(500).json({ error: 'Something went wrong' });
     });
})

//User put request by ID
router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.userId && req.params.id === req.body.userId)) {
        res.status(400).json({
            error: `ID's do not match`
        });
    }

    const updated = {};
    const updateableInfo = ['firstName', 'lastName'];
    updateableInfo.forEach(info => {
        if (info in req.body) {
            updated[info] = req.body[info];
        }
    });

    Users
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedUser => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//User delete request by ID
router.delete('/:id', (req, res) => {
    Items.
    remove({ user: req.params.id })
    .then(() => {
        Users.findByIdAndRemove(req.params.id)
            .then(() => {
                console.log(`Deleted user ${req.params.id}`);
                res.status(204).end();
            });
    });
});

module.exports = router;
