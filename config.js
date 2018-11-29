'use strict';
const DATABASE_URL = 'mongodb://justinfry:thinkful101@ds157268.mlab.com:57268/bestow';
const TEST_DATABASE_URL = 'mongodb://justinfry:thinkful10@ds157268.mlab.com:57268/bestow-test';

exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    DATABASE_URL;

exports.TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    TEST_DATABASE_URL;

exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
