const util = require('util');

function errorMessages(error) {
    var errors = [];
    Object.keys(error.errors).forEach((key) => {
        const message = error.errors[key].message;
        errors.push(message);
    });

    return { errors: errors };
}

module.exports = { errorMessages };