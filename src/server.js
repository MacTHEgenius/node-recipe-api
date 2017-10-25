
var express = require("express");
var server = express();
var bodyParser = require("body-parser");
const { ObjectId } = require('mongodb');

const { errorMessage } = require('./helpers/errorsHelpers');

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

server.get('/recipes', (req, res) => {
    // TODO: Filter params __v
    Recipe.find()
          .then((recipes) => res.status(200).send(recipes), (e) => res.status(400).send(e));
});

server.post('/recipe', (req, res) => {
    const recipe = new Recipe({name: req.body.name, description: req.body.description});
    recipe.save()
        .then((doc) => res.status(201).send(doc), (e) => {
            const errors = errorMessage(e);
            res.status(400).send(errors);
        });
});

server.patch('/recipe/:id', (req, res) => {
    const id = req.params.id;
    const newAttributes = req.body;

    if (!ObjectId.isValid(id)) return res.status(404).send({ error: "Recipe not found." }); // TODO: Duplicated code

    Recipe.findByIdAndUpdate(id, { $set: newAttributes }, { new: true })
          .then((recipe) => {
              if (!recipe) return res.status(404).send({ error: "Recipe not found." });
              res.status(200).send(recipe);
          })
          .catch((e) => res.status(400).send({ error: "Recipe not found." }));
});

server.delete('/recipe/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.status(404).send({ error: "Recipe not found." }); // TODO: Duplicated code

    Recipe.findByIdAndRemove(id)
          .then((recipe) => {
              if (!recipe) return res.status(404).send({ error: "Recipe not found." });
              res.send(recipe);
          }, (e) => res.status(404).send({ error: "Recipe not found." }))
          .catch((e) => res.sendStatus(404));
});

// Ingredients

server.get('/ingredients', (req, res) => {
    Ingredient.find().then((ingredients) => res.send(ingredients));
});

server.get('/recipe/ingredients/:recipe_id', (req, res) => {
    var recipeId = req.params.recipe_id;
    Ingredient.find({ recipe: recipeId })
              .then((ingredients) => res.send(ingredients))
              .catch((e) => res.status(400).send(e));
});

server.post('/recipe/ingredient/:recipe_id', (req, res) => {
    var recipeId = req.params.recipe_id;
    var data = req.body;
    if (!ObjectId.isValid(recipeId)) return res.sendStatus(404);
    
    Recipe.findById(recipeId)
          .then((recipe) => {
              if (!recipe) return res.status(404).send({ error: "Recipe not found." });

              var ingredientToAdd = new Ingredient({ name: data.name, count: data.count, measure: data.measure });
              ingredientToAdd.recipe = recipe;
              ingredientToAdd.save()
                        .then((ingredient) => res.send(ingredient), (e) => res.status(400).send(e))
                        .catch((e) => res.send(e));
          }, (e) => res.status(404).send({ error: "Recipe not found." }))
          .catch((e) => res.send(e));
});

server.delete('/recipe/ingredients/:ingredient_id', (req, res) => {
    var ingredientId = req.params.ingredient_id;
    if (!ObjectId.isValid(ingredientId)) return res.sendStatus(404);

    Ingredient.findByIdAndRemove(ingredientId)
              .then((ingredient) => {
                  if (!ingredient) return res.sendStatus(404);
                  res.sendStatus(200);
              }, (e) => res.status(404).send({ error: "Ingredient not found." }))
              .catch((e) => res.send(e));
});

// Listening
server.listen(port, ip, () => {
    console.log(`Server started at ${ip}:${port}`);
});

module.exports = { server };