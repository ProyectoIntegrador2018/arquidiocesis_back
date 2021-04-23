const {
  mockCollection,
  mockDoc,
} = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const coordinadores = require('../routes/coordinadores.js');
const login = require('../routes/login.js');

const mockRequest = (body, user) => ({
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.send.data = jest.fn();
  return res;
};

// Consts and tokens
const emailTest = 'testing@testing.com';
const emailTest2 = 'testing2@testing.com';
const passwordTest = 'testing_password';

//Creating fake firebase database with logins collection only
mockFirebase({
  database: {
    logins: [
      {
        password:
          '$2a$10$Hgn.AHldy4bgIB0db7Q9BeHx7S1iynxBhQ1NuyJkiGJH2jTFqtb46',
        id: emailTest2,
      },
    ],
    users: [
      {
        email: emailTest2,
        password: passwordTest,
      },
    ],
  },
});

describe('logins functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('creating login via coordinadores.js', async () => {
    /* 
    There is not a route for a direct user creation within login.js route file.
    All creation tests are made for database functionality checks.
    */

    const req = mockRequest(
      {
        identificador: '0000',
        fecha_nacimiento: '0000-00-00',
        email: emailTest,
        password: passwordTest,
      },
      {
        admin: true,
      }
    );

    const res = mockResponse();

    await coordinadores.add(db, req, res);

    expect(mockDoc).toHaveBeenCalledWith('testing@testing.com');
    expect(mockCollection).toHaveBeenCalledWith('logins');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('authenticate with a user already in store', async () => {
    const req = mockRequest(
      {
        password: passwordTest,
        email: emailTest2,
      },
      {
        admin: true,
      }
    );

    const res = mockResponse();

    await login.authenticate(db, req, res);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('change password for a user already in store', async () => {
    const req = mockRequest(
      {
        old_password: passwordTest,
        new_password: 'password_change_test',
      },
      {
        admin: true,
        id: emailTest2,
      }
    );

    const res = mockResponse();
    await login.changePassword(db, req, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});

jest.clearAllMocks();
mockCollection.mockClear();
mockDoc.mockClear();
