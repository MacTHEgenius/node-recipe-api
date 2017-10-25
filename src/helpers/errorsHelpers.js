const util = require('util');

function errorMessage(error) {
    var errors = [];
    Object.keys(error.errors).forEach((key) => {
        const message = error.errors[key].message;
        errors.push(message);
    });

    if (errors.length > 1) return { errors: errors };
    else return { error: errors[0] };
}

module.exports = { errorMessage };