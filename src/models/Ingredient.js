const mongoose = require('mongoose');
const Recipe = require('./Recipe');
const Schema = mongoose.Schema;

var ingredientSchema = new Schema({
    name: { type:String, required: true },
    count: { type: Number, required: true },
    measure: { type: String, required: true },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' }
});

var Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;