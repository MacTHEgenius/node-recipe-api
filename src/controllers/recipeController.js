const Recipe = require('./../models/Recipe');

const { ObjectId } = require('mongodb');
const { errorMessage } = require('./../helpers/errorsHelpers');

let getAll = (req, res) => {
    // TODO: Filter params __v
    Recipe.find()
        .then((recipes) => res.status(200).send(recipes), (e) => res.status(400).send(e));
};

let create = (req, res) => {
    const recipe = new Recipe({name: req.body.name, description: req.body.description});
    recipe.save()
        .then((doc) => res.status(201).send(doc), (e) => {
            const errors = errorMessage(e);
            res.status(400).send(errors);
        });
};

let update = (req, res) => {
    const id = req.params.id;
    const newAttributes = req.body;

    if (!ObjectId.isValid(id)) return res.status(404).send({ error: "Recipe not found." }); // TODO: Duplicated code

    Recipe.findByIdAndUpdate(id, { $set: newAttributes }, { new: true })
        .then((recipe) => {
            if (!recipe) return res.status(404).send({ error: "Recipe not found." });
            res.status(200).send(recipe);
        })
        .catch((e) => res.status(400).send({ error: "Recipe not found." }));
};

let remove = (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.status(404).send({ error: "Recipe not found." }); // TODO: Duplicated code

    Recipe.findByIdAndRemove(id)
        .then((recipe) => {
            if (!recipe) return res.status(404).send({ error: "Recipe not found." });
            res.send(recipe);
        }, (e) => res.status(404).send({ error: "Recipe not found." }))
        .catch((e) => res.sendStatus(404));
};


module.exports = {
    getAll, create, update, remove
};
