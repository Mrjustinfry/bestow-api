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

const itemSchema = mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      hide: {type: Boolean, default: true},
      who: {type: String, required: true},
      what: {type: String, required: true},
      when: {type: Date, default: today, required: true},
      how: {type: String, required: true}
});

const userSchema = mongoose.Schema({
      firstName: {type: String, required: true},
      lastName: {type: String, required: true},
      username: {type: String, required: true, unique: true},
      password: {type: String, required: true}
})

itemSchema.pre('find', function (next) {
    this.populate('user');
    next();
});

itemSchema.pre('findById', function (next) {
    this.populate('user');
    next();
});

itemSchema.methods.serialize = function() {
  return {
        user: this.userId,
        cardId: this._id,
        hide: this.hide,
        who: this.who,
        what: this.what,
        when: this.when.replace('T00:00:00.000Z', ''),
        how: this.how
  }
}

userSchema.methods.serialize = function() {
  return {
        userId: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username
  }
}

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const Items = mongoose.model('items', itemSchema)
const Users = mongoose.model('users', userSchema)

module.exports = { Items, Users };
