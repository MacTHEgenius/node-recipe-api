
var express = require("express");
var server = express();
var bodyParser = require("body-parser");

const recipeController = require('./controllers/recipeController');
const ingredientController = require('./controllers/ingredientController');

// DB
var { mongoose } = require('./db/mongoose');

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

server.get('/ingredients', ingredientController.getAll);
server.get('/recipe/ingredients/:recipe_id', ingredientController.getIngredientFromRecipe);
server.post('/recipe/ingredient/:recipe_id', ingredientController.create);
server.patch('/ingredient/:id', ingredientController.update);
server.delete('/recipe/ingredients/:ingredient_id', ingredientController.remove);

// Listening
server.listen(port, ip, () => {
    console.log(`Server started at ${ip}:${port}`);
});

module.exports = { server };