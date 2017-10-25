
var express = require("express");
var server = express();
var bodyParser = require("body-parser");
const { ObjectId } = require('mongodb');

const recipeController = require('./controllers/recipeController');

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