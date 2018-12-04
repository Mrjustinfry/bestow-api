'use strict';

const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const ObjectID = require('mongodb').ObjectID;

const { Items, Users } = require("./models");

//get request for items
router.get('/', (req, res) => {
    Items.find()
        .then(items => {
            res.json(items.map(item => {
                return {
                    user: item.user,
                    cardId: item._id,
                    who: item.who,
                    what: item.what,
                    when: item.when,
                    how: item.how,
                    hide: item.hide
                }
          }
            ))
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong' })
        })
});

//post request for items
router.post('/', (req, res) => {
  const requiredFields = ['who', 'what', 'when'];
      requiredFields.forEach(field => {
          if (!(field in req.body)) {
              const message = `Missing \`${field}\` in request body`;
              console.error(message);
              return res.status(400).send(message);
          }
});
      Users
          .findById(req.body.userId)
          .then(user => {
              if (user) {
          Items
              .create({
                  user: ObjectID(req.body.userId),
                  hide: true,
                  who: req.body.who,
                  what: req.body.what,
                  when: req.body.when,
                  how: req.body.how
              })
              .then(item => res.status(201).json({
                  user: item.user,
                  cardId: item._id,
                  who:  item.who,
                  what: item.what,
                  when: item.when,
                  how: item.how,
                  hide: item.hide
              }))
              .catch(err => {
                  console.error(err);
                  res.status(500).json({ error: 'Something went wrong' });
              });
            }
             else {
                      const message = `User not found`;
                      console.error(message);
                      return res.status(400).send(message);
                  }
              })
              .catch(err => {
                  console.error(err);
                  res.status(500).json({ error: 'something went wrong' });
              });
        });

//put request for items
router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.cardId && req.params.id === req.body.cardId)) {
      res.status(400).json({
          error: `ID's do not match`
    });
  }

  const updated = {};
  const updateableInfo = ['who', 'what', 'when', 'how'];
  updateableInfo.forEach(info => {
    if (info in req.body) {
        updated[info] = req.body[info];
    }
  });

  Items
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
})

router.delete('/:id', (req, res) => {
  Items.findByIdAndRemove(req.params.cardId)
    .then(() => {
        console.log(`Deleted item ${req.params.cardId}`);
        res.status(204).end();
    });
})

module.exports = router;
