"use strict";
class HttpError extends Error {
    constructor(message, status) {
        super(message);
        this.message = message;
        this.status = status;
        this.name = 'Exception';
        this.stack = (new Error()).stack;
    }
    toString() {
        return this.name + '(' + this.status + ')' + ': ' + this.message;
    }
}
exports.HttpError = HttpError;
