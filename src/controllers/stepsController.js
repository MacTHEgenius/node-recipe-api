const Step = require('./../models/Step');


let getAll = (req, res) => {
    Step.find()
        .then((steps) => res.status(200).send(steps))
        .catch((e) => res.status(500).send(e));
};

/**
 * Update fields and ingrdients array. Updating, adding and removing can be in 1 request.
 * @param req
 * @param res
 */
let update = (req, res) => {
    let id = req.params.id;
    let data = req.body;

    Step.findById(id)
        .then((step) => {
            if (data.add) {
                step.ingredients.push(data.add);
            }

            step.set(data);
            step.save((error, step) => {
                    let response = { message: "Step successfully updated.", step: step };
                    if (data.add) {
                        response.message = "Step ingredients updated.";
                        response.ingredients = data.add;
                    }
                    res.status(200).send(response);
                })
        })
        .catch((e) => res.status(500).send(e));
};


module.exports = {
    getAll, update
};