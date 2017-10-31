const mongoose = require("mongoose");
const Ingredient = require('./Ingredient');

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    name: { type: String, required: true, minLength: 1, maxLength: 30, trim: true },
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: Date
});

recipeSchema.post('findOneAndRemove', (error, recipe, next) => {
    if (error) next(error);
    Ingredient.remove({ "recipe": recipe._id }).exec();
});

recipeSchema.post('findOneAndUpdate', (error, recipe, next) => {
    if (error) next(error);
    recipe.updated_at = Date.now();
    recipe.save();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;