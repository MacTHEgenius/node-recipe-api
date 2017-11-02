const Step = require('./../models/Step');


let getAll = (req, res) => {
    Step.find()
        .then((steps) => res.status(200).send(steps))
        .catch((e) => res.status(500).send(e));
};

/**
 * Update fields and ingrdients array. Updating, adding and removing are 1 request each.
 * @param req
 * @param res
 */
let update = (req, res) => {
    let id = req.params.id;
    let data = req.body;

    if (data.add) {
        Step.findById(id)
            .then((step) => {
                step.ingredients.push(data.add);
                step.save()
                    .then(() => {
                        let response = {
                            message: "Ingredients added.", ingredients: data.add, step: id
                        };
                        res.status(200).send(response);
                    });
            })
            .catch((e) => res.status(500).send(e));
    } else {
        Step.findByIdAndUpdate(id, { $set: data }, { new: true })
            .then((step) => {
                let response = {
                    message: "Step successfully updated.", step: step
                };
                res.status(200).send(response);
            });
    }
};


module.exports = {
    getAll, update
};