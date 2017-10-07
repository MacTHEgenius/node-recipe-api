const mongoose = require("mongoose");
const Ingredient = require('./Ingredient');

const Schema = mongoose.Schema;

var recipeSchema = new Schema({
    name: { type: String, required: true, minLength: 1, maxLength: 30, trim: true },
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: Date
});

recipeSchema.post('findOneAndRemove', (recipe) => {
    Ingredient.remove({ "recipe": recipe._id }).exec();
});

var Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;