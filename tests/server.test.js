const expect = require('expect');
const request = require('supertest');

const { server } = require('./../src/server');
const Recipe = require('./../src/models/Recipe');

describe('GET /recipes', () => {
    it('should get all recipes', (done) => {
        request(server)
            .get('/recipes')
            .expect(200)
            .end(done);
    });
});