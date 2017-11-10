const mongoose = require('mongoose');
const Recipe = require('./Recipe');
const Schema = mongoose.Schema;

const stepSchema = new Schema({
    description: { type: String, required: true },
    position: { type: Number, required: true },
    ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' }
});

stepSchema.index({ position: 1, _id: 1 }, { unique: true });

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;