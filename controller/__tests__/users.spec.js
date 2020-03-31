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
  it('Should show an error 400 if not send email', (done) => {
    const req = {
      body: {
        email: '',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUser(req, {}, next);
  });
  it('Should show an error 400 when email is not valid', (done) => {
    const req = {
      body: {
        email: 'test1@test',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUser(req, {}, next);
  });
  it('Should show an error 400 when password have lass than 4 characters', (done) => {
    const req = {
      body: {
        email: 'test1@test.com',
        password: '12',
        roles: { admin: false }
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUser(req, {}, next);
  });
  it('Should show an error 403 if user exists', (done) => {
    const req = {
      body: {
        email: 'test1@test.com',
        password: '123456',
      },
    };
    const next = (code) => {
      expect(code).toBe(403);
      done();
    };
    createUser(req, {}, next)
  });
});

describe('getUsers', () => {
  it('should get users collection', (done) => {
    done();
  });
});
