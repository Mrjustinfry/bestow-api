'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

mongoose.Promise = global.Promise;

const today = () => {
    let today = new Date();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let year = today.getFullYear();
    if (day < 10) {
        day = '0' + day
    } if (month < 10) {
        month = '0' + month
    }
    today = year + month + day;
    return today;
}

const bestowSchema = mongoose.Schema({
    user: [{
       firstName: {type: String, required: true},
       lastName: {type: String, required: true},
       username: {type: String, required: true, unique: true},
       password: {type: String, required: true}
     }],
     items: [{
       who: {type: String, required: true},
       what: {type: String, required: true},
       when: {type: Date, default: today, required: true},
       how: {type: String, required: true}
     }]
})


bestowSchema.methods.serialize = function () {
    return {
      user: [{
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        password: this.password
      }],
      items: [{
        id: this._id,
        who: this.who,
        what: this.what,
        when: this.when,
        how: this.how
      }]
    };
};

bestowSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

bestowSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const Bestow = mongoose.model('bestow', bestowSchema)

module.exports = { Bestow };
