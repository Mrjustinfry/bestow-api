'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const faker = require('faker');
const mongoose = require('mongoose');

chai.use(chaiHttp);

const { Items, Users } = require('../models');
const { closeServer, runServer, app } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

function seedItemData() {
    console.info('seeding data');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
        seedData.push({
            who:  faker.lorem.words(),
            what: faker.lorem.words(),
            how: 'bestowed'
        });
    }
    return Items.insertMany(seedData);
    console.log(seedData);
}

describe('/api/items', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedItemData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

describe('GET requests for Items', function () {
      it('Should display all items with a 200 status', function () {
          let res;
          return chai.request(app)
              .get('/api/items')
              .then(_res => {
                  res = _res;
                  res.should.have.status(200);
                  res.body.should.have.lengthOf.at.least(1)
                  return Items.count();
              })
              .then(count => {
                  res.body.should.have.lengthOf(count);
              })
      })

      it('Should return items with correct info', function () {
          let resItem;
          return chai.request(app)
              .get('/api/items')
              .then(function (res) {
                  res.should.have.status(200);
                  res.should.be.json;
                  res.body.should.be.a('array');
                  res.body.should.have.a.lengthOf.at.least(1);
                  res.body.forEach(function (post) {
                      post.should.be.a('object');
                      post.should.include.keys('cardId', 'who', 'what', 'when', 'how');
                  });
                  resItem = res.body[0];
                  return Items.findById(resItem.cardId)
              })
              .then(item => {
                  resItem.who.should.equal(item.who);
                  resItem.what.should.equal(item.what);
                  resItem.how.should.equal(item.how);
              })
      })
});

describe('POST requests for Items', function () {
      it('Should add a new item', function () {

         const newUser = {
             firstName: 'john',
             lastName: 'doe',
             username: 'mrjohnddoee',
             password: 'Thinkful101'
         }
         return Users.create(newUser);
         const newItem = {
              who: 'jane',
              what: 'thing',
              how: 'borrowed',
         }

         return chai.request(app)
             .post('/api/users')
             .send(newUser)
             .then(() => {

         return chai.request(app)
             .post('/api/items')
             .send(newItem)
             .then(res => {
                 res.should.have.status(201);
                 res.should.be.json;
                 res.body.should.be.a('object');
                 res.body.should.include.keys('cardId', 'who', 'what', 'when', 'how', 'hide');
                 res.body.who.should.equal(newItem.who);
                 res.body.what.should.equal(newItem.what);
                 res.body.cardId.should.not.be.null;
                 res.body.hide.should.equal(newItem.hide);
                 return Items.findById(res.body.id);
             })
             .then(item => {
                 item.who.should.equal(newItem.who);
                 item.what.should.equal(newItem.what);
                 item.hide.should.equal(newItem.hide);
             })
             })
     })
});

describe('PUT request for Items', function () {
      it('Should update an item', function () {
            const updatedItem = {
                cardId: '',
                who: "George",
                what: "Stuff",
                how: "bestowed"
            }
            return Items.findOne()
                .then(item => {
                    updatedItem.cardId = item._id;
                    return chai.request(app)
                        .put(`/api/items/${updatedItem.cardId}`)
                        .send(updatedItem)
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Items.findById(updatedItem.cardId);
                })
                .then(res => {
                    res.who.should.equal(updatedItem.who);
                    res.what.should.equal(updatedItem.what);
                    res.how.should.equal(updatedItem.how);
                })
        })
})

describe.only('DELETE requests for Items', function () {
      it('Should delete an item by id', function () {
            let item;
            return Items
                .findOne()
                .then(_item => {
                    item = _item;
                    return chai.request(app).delete(`/api/items/${item.id}`);
                })
                .then(res => {
                    res.should.have.status(204);
                    return Items.findById(item.id);
                })
                .then(_item => {
                    should.not.exist(_item);
                });
        });
})

});
