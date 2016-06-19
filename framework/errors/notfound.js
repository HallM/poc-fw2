"use strict";
const index_1 = require('./index');
class NotFoundError extends index_1.HttpError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
