const database = require('../../connection/connectDB');

const {
  getUsers,
  createUser,
} = require('../../controller/users');

describe('createUser', () => {
  beforeAll(async () => {
    await database();
  });
  afterAll(async () => {
    const collectionUsers = (await database()).collection('users');
    await collectionUsers.deleteMany({});
    await database().close();
  });
  it('should create a new user', (done) => {
    const req = {
      body: {
        email: 'test1@test.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('test1@test.com');
        expect(response.roles.admin).toBe(false);
        done();
      },
    };
    createUser(req, resp);
  });
});

describe('getUsers', () => {
  it('should get users collection', (done) => {
    done();
  });
});
