
var express = require("express");
var server = express();
var bodyParser = require("body-parser");
const { ObjectId } = require('mongodb');

const recipeController = require('./controllers/recipeController');
const { errorMessages } = require('./helpers/errorsHelpers');

// DB
var { mongoose } = require('./db/mongoose');
var Recipe = require('./models/Recipe');
var Ingredient = require('./models/Ingredient');

// Set up packages
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Server set up
var ip = process.env.RECIPE_API_IP || "127.0.0.1";
var port = process.env.RECIPE_API_PORT || 8081;

/************
 *  Routes  *
 ************/

server.get('/', (req, res) => {
    res.sendFile("./index.html");
});

// Recipes

server.get('/recipes', recipeController.getAll);

server.post('/recipe', recipeController.create);

server.patch('/recipe/:id', recipeController.update);

server.delete('/recipe/:id', recipeController.remove);

// Ingredients

server.get('/ingredients', (req, res) => {
    Ingredient.find()
        .then((ingredients) => res.status(200).send(ingredients))
        .catch((e) => res.status(500).send(e));
});

server.get('/recipe/ingredients/:recipe_id', (req, res) => {
    const recipeId = req.params.recipe_id;

    if (!ObjectId.isValid(recipeId)) return res.status(404).send({ error: "Recipe not found." });

    Ingredient.find({ recipe: recipeId })
        .then((ingredients) => {
            res.status(200).send(ingredients);
        })
        .catch((e) => res.status(500).send(e));
});

server.post('/recipe/ingredient/:recipe_id', (req, res) => {
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
});

server.delete('/recipe/ingredients/:ingredient_id', (req, res) => {
    var ingredientId = req.params.ingredient_id;
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
});

// Listening
server.listen(port, ip, () => {
    console.log(`Server started at ${ip}:${port}`);
});

module.exports = { server };