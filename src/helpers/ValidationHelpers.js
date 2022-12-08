"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrWhitespace = void 0;
function isNullOrWhitespace(input) {
    if (typeof input === 'undefined' || input == null)
        return true;
    return input.toString().replace(/\s/g, '').length < 1;
}
exports.isNullOrWhitespace = isNullOrWhitespace;
