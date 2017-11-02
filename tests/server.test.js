const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {server} = require('./../src/server');
const Recipe = require('./../src/models/Recipe');
const Ingredient = require('./../src/models/Ingredient');
const Step = require('./../src/models/Step');

const RECIPES = [
    {_id: new ObjectID(), name: "My first recipe", description: "My first description"},
    {_id: new ObjectID(), name: "My second recipe", description: "My second description"},
    {_id: new ObjectID(), name: "My third recipe", description: "My third description"}
];

const INGREDIENTS = [
    {_id: new ObjectID(), name: "flour", count: 2, measure: "cup", recipe: RECIPES[0]._id},
    {_id: new ObjectID(), name: "cocoa", count: 3, measure: "tablespoon", recipe: RECIPES[0]._id},
    {_id: new ObjectID(), name: "potato", count: 4, measure: "item", recipe: RECIPES[1]._id},
];

const STEPS = [
    {_id: new ObjectID(), description: "Step 1", position: 1, ingredients: [INGREDIENTS[0]._id], recipe: RECIPES[0]._id},
    {_id: new ObjectID(), description: "Step 2", position: 2, ingredients: [INGREDIENTS[1]._id], recipe: RECIPES[0]._id},
    {_id: new ObjectID(), description: "Step 1", position: 1, ingredients: [INGREDIENTS[2]._id], recipe: RECIPES[1]._id},
];

beforeEach((done) => {
    Recipe.remove({})
        .then(() => { return Recipe.insertMany(RECIPES); })
        .then(() => {
            Ingredient.remove({})
                .then(() => { return Ingredient.insertMany(INGREDIENTS); })
                .then(() => {
                    Step.remove({})
                        .then(() => { return Step.insertMany(STEPS); })
                        .then(() => done());
                });
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
                    expect(res.body.errors[0]).toBe('Path `name` is required.')
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

        it('should delete all ingredients and steps linked', (done) => {
            // TODO: should delete all ingredients and steps linked
            done();
        })

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
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Recipe not found.")
                })
                .end(done);
        });

        it('should get empty array with a valid id and non-existing recipe', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .get(`/recipe/ingredients/${VALID_ID}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(0))
                .end(done);
        });

    });

    describe('POST /recipe/ingredient/:recipe_id', () => {

        const RECIPE = RECIPES[0];
        const NEW_POSTED_INGREDIENT = { name: "oil", count: 1, measure: "tablespoon" };

        it('should add a new ingredient', (done) => {
            request(server)
                .post(`/recipe/ingredient/${RECIPE._id}`)
                .send(NEW_POSTED_INGREDIENT)
                .expect(201)
                .expect((res) => {
                    expect(res.body.message).toBe("Ingredient successfully created.");
                    expect(res.body.ingredient.name).toBe(NEW_POSTED_INGREDIENT.name);
                    expect(res.body.ingredient.count).toBe(NEW_POSTED_INGREDIENT.count);
                    expect(res.body.ingredient.measure).toBe(NEW_POSTED_INGREDIENT.measure);
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            const ingredient = ingredientsFound[0];
                            expect(ingredient.name).toBe(NEW_POSTED_INGREDIENT.name);
                            expect(ingredient.count).toBe(NEW_POSTED_INGREDIENT.count);
                            expect(ingredient.measure).toBe(NEW_POSTED_INGREDIENT.measure);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should assign ingredient to a recipe', (done) => {
            request(server)
                .post(`/recipe/ingredient/${RECIPE._id}`)
                .send(NEW_POSTED_INGREDIENT)
                .expect(201)
                .expect((res) => {
                    expect(res.body.ingredient.recipe._id).toBe(`${RECIPE._id}`);
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientFound) => {
                            expect(`${ingredientFound[0].recipe}`).toBe(`${RECIPE._id}`);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should not add ingredient with missing name', (done) => {
            request(server)
                .post(`/recipe/ingredient/${RECIPE._id}`)
                .send({ count: NEW_POSTED_INGREDIENT.count, measure: NEW_POSTED_INGREDIENT.measure })
                .expect(422)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0]).toBe("Path `name` is required.");
                    expect(res.body.message).toBe("There were some errors.");
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should not add ingredient with missing count', (done) => {
            request(server)
                .post(`/recipe/ingredient/${RECIPE._id}`)
                .send({ name: NEW_POSTED_INGREDIENT.name, measure: NEW_POSTED_INGREDIENT.measure })
                .expect(422)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0]).toBe("Path `count` is required.");
                    expect(res.body.message).toBe("There were some errors.");
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should not add ingredient with missing measure', (done) => {
            request(server)
                .post(`/recipe/ingredient/${RECIPE._id}`)
                .send({ count: NEW_POSTED_INGREDIENT.count, name: NEW_POSTED_INGREDIENT.name })
                .expect(422)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0]).toBe("Path `measure` is required.");
                    expect(res.body.message).toBe("There were some errors.");
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should not add ingredient with invalid recipe id', (done) => {
            request(server)
                .post(`/recipe/ingredient/1`)
                .send(NEW_POSTED_INGREDIENT)
                .expect(404)
                .expect((res) => {
                    expect(res.body.message).toBe("Recipe not found.");
                    expect(res.body.error).toBe(true);
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

        it('should not add ingredient with valid recipe id but non-existing one', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .post(`/recipe/ingredient/${VALID_ID}`)
                .send(NEW_POSTED_INGREDIENT)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Recipe not found.");
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.find({ name: NEW_POSTED_INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) =>  done(e));
                })
        });

    });

    describe('PATCH /ingredient/:id', () => {

        const INGREDIENT = INGREDIENTS[0];
        const NEW_NAME = { name: "An updated name" };
        const NEW_COUNT = { count: 2000 };
        const NEW_MEASURE = { measure: "TB" };

        it('should update ingredient name', (done) => {
            request(server)
                .patch(`/ingredient/${ INGREDIENT._id }`)
                .send(NEW_NAME)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Ingredient successfully updated.");
                    expect(res.body.ingredient._id).toBe(`${INGREDIENT._id}`);
                    expect(res.body.ingredient.name).toBe(NEW_NAME.name);
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.findById(INGREDIENT._id)
                        .then((ingredient) => {
                            expect(ingredient.name).toBe(NEW_NAME.name);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should update ingredient count', (done) => {
            request(server)
                .patch(`/ingredient/${ INGREDIENT._id }`)
                .send(NEW_COUNT)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Ingredient successfully updated.");
                    expect(res.body.ingredient._id).toBe(`${INGREDIENT._id}`);
                    expect(res.body.ingredient.count).toBe(NEW_COUNT.count);
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.findById(INGREDIENT._id)
                        .then((ingredient) => {
                            expect(ingredient.count).toBe(NEW_COUNT.count);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should update ingredient measure', (done) => {
            request(server)
                .patch(`/ingredient/${ INGREDIENT._id }`)
                .send(NEW_MEASURE)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Ingredient successfully updated.");
                    expect(res.body.ingredient._id).toBe(`${INGREDIENT._id}`);
                    expect(res.body.ingredient.measure).toBe(NEW_MEASURE.measure);
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.findById(INGREDIENT._id)
                        .then((ingredient) => {
                            expect(ingredient.measure).toBe(NEW_MEASURE.measure);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should not update with invalid id', (done) => {
            request(server)
                .patch(`/ingredient/1`)
                .send(NEW_NAME)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Ingredient not found.");
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.findById(INGREDIENT._id)
                        .then((ingredient) => {
                            expect(ingredient.name).toBe(INGREDIENT.name);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should not update with non-existence ingredient', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .patch(`/ingredient/${ VALID_ID }`)
                .send(NEW_NAME)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Ingredient not found.");
                })
                .end((error) => {
                    if (error) return done(error);

                    Ingredient.findById(INGREDIENT._id)
                        .then((ingredient) => {
                            expect(ingredient.name).toBe(INGREDIENT.name);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

    });

    describe('DELETE /ingredient/:id', (req, res) => {

        const INGREDIENT = INGREDIENTS[0];

        it('should delete ingredient', (done) => {
            request(server)
                .delete(`/ingredient/${ INGREDIENT._id }`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Ingredient successfully deleted.");
                    expect(res.body.ingredient).toBe(`${INGREDIENT._id}`);
                })
                .end((error, res) => {
                    if (error) return done(error);

                    Ingredient.find({ name: INGREDIENT.name })
                        .then((ingredientsFound) => {
                            expect(ingredientsFound.length).toBe(0);
                            done();
                        })
                        .catch((e) => done(error));
                });
        });

        it('should not delete ingredient with invalid id', (done) => {
            request(server)
                .delete(`/ingredient/1`)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Ingredient not found.");
                })
                .end(done);
        });

        it('should not delete ingredient with valid id and non-existence id', (done) => {
            const VALID_ID = new ObjectID();

            request(server)
                .delete(`/ingredient/${VALID_ID}`)
                .expect(404)
                .expect((res) => {
                    expect(res.body.error).toBe(true);
                    expect(res.body.message).toBe("Ingredient not found.");
                })
                .end(done);
        });

    });

});

/* Steps */

describe('Steps tests', () => {

    describe('GET /steps', () => {

        it('should get all steps', (done) => {
            request(server)
                .get('/steps')
                .expect(200)
                .expect((res) => {
                    expect(res.body.length).toBe(3);
                })
                .end(done);
        });

    });

    describe('PATCH /step/:id', () => {

        const STEP = STEPS[0];
        const NEW_DESCRIPTION = { description: "Step 1 updated." };
        const NEW_POSITION = { position: 2 };

        it('should update description', (done) => {
            request(server)
                .patch(`/step/${STEP._id}`)
                .send(NEW_DESCRIPTION)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Step successfully updated.");
                    expect(res.body.step.description).toBe(NEW_DESCRIPTION.description);
                    expect(res.body.step.position).toBe(STEP.position);
                })
                .end((error) => {
                    if (error) return done(error);

                    Step.findById(STEP._id)
                        .then((step) => {
                            expect(step.description).toBe(NEW_DESCRIPTION.description);
                            expect(step.position).toBe(STEP.position);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should update position', (done) => {
            request(server)
                .patch(`/step/${STEP._id}`)
                .send(NEW_POSITION)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Step successfully updated.");
                    expect(res.body.step.position).toBe(NEW_POSITION.position);
                    expect(res.body.step.description).toBe(STEP.description);
                })
                .end((error) => {
                    if (error) return done(error);

                    Step.findById(STEP._id)
                        .then((step) => {
                            expect(step.position).toBe(NEW_POSITION.position);
                            expect(step.description).toBe(STEP.description);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should update step by adding one ingredient', (done) => {
            const INGREDIENT_TO_ADD = INGREDIENTS[1]._id;

            request(server)
                .patch(`/step/${STEP._id}`)
                .send({ add: [INGREDIENT_TO_ADD] })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Step ingredients updated.");
                    expect(res.body.added[0]).toBe(`${INGREDIENT_TO_ADD}`);
                    expect(res.body.step._id).toBe(`${STEP._id}`);
                })
                .end((error) => {
                    if (error) return done(error);

                    Step.findById(STEP._id)
                        .then((step) => {
                            expect(step.ingredients.length).toBe(2);
                            expect(step.ingredients[1]).toEqual(INGREDIENT_TO_ADD);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should update step by removing one ingredient linked', (done) => {
            const INGREDIENT_TO_REMOVE = INGREDIENTS[0]._id;

            request(server)
                .patch(`/step/${STEP._id}`)
                .send({ remove: [INGREDIENT_TO_REMOVE] })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe("Step ingredients updated.");
                    expect(res.body.removed[0]).toBe(`${INGREDIENT_TO_REMOVE}`);
                    expect(res.body.step._id).toBe(`${STEP._id}`);
                })
                .end((error) => {
                    if (error) return done(error);

                    Step.findById(STEP._id)
                        .then((step) => {
                            expect(step.ingredients.length).toBe(0);
                            done();
                        })
                        .catch((e) => done(e));
                });
        });

        it('should not update description with invalid id', (done) => {
            done();
        });

        it('should not update description with valid id but non-existence step', (done) => {
            done();
        });

    });

    describe('DELETE /step/:id', () => {

    });

    describe('GET /recipe/steps/:recipe_id', () => {

    });

    describe('POST /recipe/step/:recipe_id', () => {

    });

});
