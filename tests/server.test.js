const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {server} = require('./../src/server');
const Recipe = require('./../src/models/Recipe');
const Ingredient = require('./../src/models/Ingredient');

const RECIPES = [
    {_id: new ObjectID(), name: "My first recipe", description: "My first description"},
    {_id: new ObjectID(), name: "My second recipe", description: "My second description"},
    {_id: new ObjectID(), name: "My third recipe", description: "My third description"}
];

const INGREDIENTS = [
    {name: "flour", count: 2, measure: "cup", recipe: RECIPES[0]._id},
    {name: "cocoa", count: 3, measure: "tablespoon", recipe: RECIPES[0]._id},
    {name: "potato", count: 4, measure: "item", recipe: RECIPES[1]._id},
];

beforeEach((done) => {
    Recipe.remove({})
        .then(() => {
            return Recipe.insertMany(RECIPES)
        })
        .then(() => {
            Ingredient.remove({})
                .then(() => {
                    return Ingredient.insertMany(INGREDIENTS)
                })
                .then(() => done());
        });
});

/* Recipes */

describe('Recipes tests', () => {

    describe('GET /recipes', () => {
        it('should get all recipes', (done) => {
            request(server)
                .get('/recipes')
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(RECIPES.length))
                .end(done);
        });
    });

    describe('POST /recipe', () => {

        const NEW_POSTED_RECIPE = {name: "My new recipe", description: "A new description for my new recipe."};

        it('should create a new recipe with a name and a description', (done) => {
            request(server)
                .post('/recipe')
                .send(NEW_POSTED_RECIPE)
                .expect(201)
                .expect((res) => {
                    expect(res.body.name).toBe(NEW_POSTED_RECIPE.name);
                    expect(res.body.description).toBe(NEW_POSTED_RECIPE.description);
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Recipe.find({name: NEW_POSTED_RECIPE.name})
                        .then((recipesFound) => {
                            expect(recipesFound.length).toBe(1);
                            expect(recipesFound[0].name).toBe(NEW_POSTED_RECIPE.name);
                            expect(recipesFound[0].description).toBe(NEW_POSTED_RECIPE.description);
                            done();
                        })
                        .catch((e) => done(e))
                });
        });

        it('should not create a new recipe without a name', (done) => {
            request(server)
                .post('/recipe')
                .send({description: NEW_POSTED_RECIPE.description})
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).toBe('Path `name` is required.')
                })
                .end(done);
        })
    });

    describe('PATCH /recipe/:id', () => {

        const NEW_RECIPE_NAME = "My updated name";
        const ID_TO_UPDATE = RECIPES[0]._id;

        it('should update recipe with new name', (done) => {
            request(server)
                .patch(`/recipe/${ID_TO_UPDATE}`)
                .send({name: NEW_RECIPE_NAME})
                .expect(200)
                .expect((res) => expect(res.body.name).toBe(NEW_RECIPE_NAME))
                .end(done);
        });

        it('should not update recipe, returns a not found error with invalid id', (done) => {
            request(server)
                .patch('/recipe/1')
                .send({name: NEW_RECIPE_NAME})
                .expect(404)
                .expect((res) => expect(res.body.error).toBe("Recipe not found."))
                .end(done);
        });

        it('should not update recipe, returns a not found error with a valid id and non-existing recipe', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .patch(`/recipe/${VALID_ID}`)
                .send({name: NEW_RECIPE_NAME})
                .expect(404)
                .expect((res) => expect(res.body.error).toBe("Recipe not found."))
                .end(done);
        });

    });

    describe('DELETE /recipe/:id', () => {

        const ID_TO_DELETE = RECIPES[0]._id;

        it('should delete recipe', (done) => {
            request(server)
                .delete(`/recipe/${ID_TO_DELETE}`)
                .expect(200)
                .end((error) => {
                    if (error) done(error);

                    Recipe.count().then((count) => {
                        expect(count).toBe(RECIPES.length - 1);
                        done();
                    });
                });
        });

        it('should not delete recipe, returns a not found error with invalid id', (done) => {
            request(server)
                .delete('/recipe/1')
                .expect(404)
                .end((error) => {
                    if (error) done(error);

                    Recipe.count().then((count) => {
                        expect(count).toBe(RECIPES.length);
                        done();
                    });
                });
        });

        it('should not delete recipe, returns a not found error with a valid id and a non-existing recipe', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .delete(`/recipe/${VALID_ID}`)
                .expect(404)
                .end((error) => {
                    if (error) done(error);

                    Recipe.count().then((count) => {
                        expect(count).toBe(RECIPES.length);
                        done();
                    });
                });
        });

    });

});

/* Ingredients */

describe('Ingredients tests', () => {

    describe('GET /ingredients', () => {

        it('should get all ingredients from every recipes', (done) => {
            request(server)
                .get('/ingredients')
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(INGREDIENTS.length))
                .end(done);
        });

    });

    describe('GET /recipe/ingredients/:id', () => {
        const RECIPE = RECIPES[0];

        it('should get all ingredients from a recipe', (done) => {
            request(server)
                .get(`/recipe/ingredients/${RECIPE._id}`)
                .expect(200)
                .expect((res) => {
                    const ingredientsCount = INGREDIENTS.filter((i) => i.recipe === RECIPE._id).length;
                    expect(res.body.length).toBe(ingredientsCount);
                })
                .end(done);
        });

        it('should not get ingredients recipe, returns a not found error with invalid id', (done) => {
            request(server)
                .get('/recipe/ingredients/1')
                .expect(404)
                .expect((res) => expect(res.body.error).toBe("Recipe not found."))
                .end(done);
        });

        it('should not get ingredients recipe, returns a not found error with a valid id and non-existing recipe', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .get(`/recipe/ingredients/${VALID_ID}`)
                .expect(404)
                .expect((res) => expect(res.body.error).toBe("Recipe not found."))
                .end(done);
        });

    });

});
