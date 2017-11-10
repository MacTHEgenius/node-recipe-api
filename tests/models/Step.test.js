const expect = require('expect');

const Step = require('./../../src/models/Step');

describe('Step model tests', () => {

    it('should be valid with description and position', (done) => {
        let step = new Step({ description: "Step 1", position: 1 });

        step.validate((error) => {
            expect(error).toBeFalsy();
            done();
        });
    });

    it('should be invalid if description is missing', (done) => {
        let step = new Step({ position: 1 });

        step.validate((error) => {
            expect(error.errors.description).toBeTruthy();
            done();
        });
    });

    it('should be invalid if position is missing', (done) => {
        let step = new Step({ description: "Step 1" });

        step.validate((error) => {
            expect(error.errors.position).toBeTruthy();
            done();
        });
    });

});