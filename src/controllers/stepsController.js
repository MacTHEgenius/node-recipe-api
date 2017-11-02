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
            if (data.remove) {
                var array = [];
                for (var i = 0; i < step.ingredients.length; i++) {
                    if (!data.remove.includes(`${step.ingredients[i]}`)) {
                        array.push(step.ingredients[i]);
                    }
                }
                step.ingredients = array;
            }

            step.set(data);
            step.save((error, step) => {
                    let response = { message: "Step successfully updated.", step: step };
                    if (data.add || data.remove) {
                        response.message = "Step ingredients updated.";
                        response.added = data.add;
                        response.removed = data.remove;
                    }
                    res.status(200).send(response);
                })
        })
        .catch((e) => {
            console.log(e);
            res.status(500).send(e)
        });
};


module.exports = {
    getAll, update
};