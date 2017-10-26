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
        .then((doc) => res.status(201).send(doc),
        (e) => {
            const errors = errorMessage(e);
            res.status(400).send(errors);
        });
};

let update = (req, res) => {
    const id = req.params.id;
    const newAttributes = req.body;

    if (!ObjectId.isValid(id)) return sendError(res);

    Recipe.findByIdAndUpdate(id, { $set: newAttributes }, { new: true })
        .then((recipe) => {
            if (!recipe) return sendError(res);
            res.status(200).send(recipe);
        })
        .catch((e) => sendError(res));
};

let remove = (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return sendError(res);

    Recipe.findByIdAndRemove(id)
        .then((recipe) => {
            if (!recipe) return sendError(res);
            res.status(200).send(recipe);
        }, (e) => sendError(res))
        .catch((e) => sendError(res));
};

function sendDoc(res, doc, created=false) {
    if (created) res.status(201).send(doc);
    res.status(200).send(doc);
}

function sendError(res, errors=undefined) {
    if (errors) res.status(400).send(errors);
    return res.status(404).send({ error: "Recipe not found." });
}


module.exports = {
    getAll, create, update, remove
};
