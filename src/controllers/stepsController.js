const Step = require('./../models/Step');

let getAll = (req, res) => {
    Step.find()
        .then((steps) => res.status(200).send(steps))
        .catch((e) => res.status(500).send(e));
};

module.exports = {
    getAll
};