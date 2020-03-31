jest.mock('../../connection/connectDB');
const database = require('../../connection/connectDB');

const {
    createUser,
} = require('../../controller/users');

describe('users errors', () => {
    beforeAll(async () => {
        await database();
    });
    afterAll(async () => {
        await database().close();
    });
    it('Should show an error 500 when exist an error with database: createUser', (done) => {
        const req = {
            body: {
                email: 'test1@test.com',
                password: '1234567',
                roles: {
                    admin: false,
                }
            }
        };
        const next = (code) => {
            expect(code).toBe(500);
            done();
        };
        createUser(req, {}, next);
    });
});