const Step = require('./../models/Step');

const { ObjectId } = require('mongodb');


let getAll = (req, res) => {
    Step.find()
        .then((steps) => res.status(200).send(steps))
        .catch((e) => res.status(500).send(e));
};

let getStepsFromRecipe = (req, res) => {
    const recipeId = req.params.recipe_id;

    if (!ObjectId.isValid(recipeId)) {
        let response = {
            message: "Recipe not found.", error: true
        };
        return res.status(404).send(response);
    }

    Step.find({ recipe: recipeId })
        .then((steps) => {
            res.status(200).send(steps);
        })
        .catch((e) => res.status(500).send(e));
    // res.status(501).send({ error: "Not implemented." });
};

/**
 * Update fields and ingrdients array. Updating, adding and removing can be in 1 request.
 * @param req
 * @param res
 */
let update = (req, res) => {
    let errorResponse = { message: "Step not found.", error: true };
    let id = req.params.id;
    let data = req.body;

    if (!ObjectId.isValid(id)) return res.status(404).send(errorResponse);

    Step.findById(id)
        .then((step) => {
            if (!step) return res.status(404).send(errorResponse);

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
    getAll, update, getStepsFromRecipe
};