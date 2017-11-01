const Ingredient = require('./../models/Ingredient');

const Recipe = require('./../models/Recipe');

const { ObjectId } = require('mongodb');
const { errorMessages } = require('./../helpers/errorsHelpers');


let getAll = (req, res) => {
    Ingredient.find()
        .then((ingredients) => res.status(200).send(ingredients))
        .catch((e) => res.status(500).send(e));
};

let getIngredientFromRecipe = (req, res) => {
    const recipeId = req.params.recipe_id;

    if (!ObjectId.isValid(recipeId)) return res.status(404).send({ error: "Recipe not found." });

    Ingredient.find({ recipe: recipeId })
        .then((ingredients) => {
            res.status(200).send(ingredients);
        })
        .catch((e) => res.status(500).send(e));
};

let create = (req, res) => {
    const recipeId = req.params.recipe_id;
    const data = req.body;

    if (!ObjectId.isValid(recipeId)) {
        let response = {
            message: "Recipe not found.", error: true
        };
        return res.status(404).send(response);
    }

    Recipe.findById(recipeId)
        .then((recipe) => {

            if (recipe) {
                const ingredientToAdd = new Ingredient(data);
                ingredientToAdd.recipe = recipe;
                ingredientToAdd.save()
                    .then((ingredient) => {
                        let response = {
                            message: "Ingredient successfully created.", ingredient: ingredient
                        };
                        res.status(201).send(response);
                    })
                    .catch((e) => {
                        let response = {
                            message: "There were some errors.", error: true,
                            errors: errorMessages(e).errors // TODO: just the array.
                        };
                        res.status(422).send(response);
                    });
            } else {
                let response = {
                    message: "Recipe not found.", error: true
                };
                res.status(404).send(response);
            }

        })
        .catch((e) => res.status(500).send(e));
};

let update = (req, res) => {
    const id = req.params.id;
    const newAttributes = req.body;

    if (!ObjectId.isValid(id)) {
        let response = {
            message: "Ingredient not found.", error: true
        };
        return res.status(404).send(response);
    }

    Ingredient.findByIdAndUpdate(id, { $set: newAttributes }, { new: true})
        .then((ingredient) => {
            if (ingredient) {
                let response = {
                    message: "Ingredient successfully updated.",
                    ingredient: ingredient
                };
                res.status(200).send(response);
            } else {
                let response = {
                    message: "Ingredient not found.", error: true
                };
                res.status(404).send(response);
            }
        })
        .catch((e) => res.status(500).send(e));
};

let remove = (req, res) => {
    const ingredientId = req.params.id;
    if (!ObjectId.isValid(ingredientId)) {
        let response = {
            message: "Ingredient not found.",
            error: true
        };
        return res.status(404).send(response);
    }

    Ingredient.findByIdAndRemove(ingredientId)
        .then((ingredient) => {
            if (ingredient) {
                let response = {
                    message: "Ingredient successfully deleted.",
                    ingredient: ingredient._id
                };
                res.status(200).send(response);
            } else {
                let response = {
                    message: "Ingredient not found.",
                    error: true
                };
                res.status(404).send(response);
            }
        })
        .catch((e) => {
            console.log(e);
            res.status(500).send(e);
        });
};


module.exports = {
    getAll, getIngredientFromRecipe, create, update, remove
};