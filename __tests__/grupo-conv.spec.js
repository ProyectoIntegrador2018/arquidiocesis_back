const {mockCollection} = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const grupo = require('../routes/grupo-conv');

const mockRequest = (body) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.send.data = jest.fn();
  return res;
};

//Creating fake firebase database
mockFirebase({
  database: {
    grupo_conv: [
      {nombre: 'testing1', canales: ['id1', 'id2', 'id3'], roles: ['rol1', 'rol2', 'rol3']},
      {nombre: 'testing2', canales: [], roles: ['rol1', 'rol2', 'rol3']},
      {nombre: 'testing3', canales: ['id1', 'id2', 'id3'], roles: []},
      {nombre: 'testing4', canales: [], roles: []}
    ],
  },
});

//Creating test suite for grupo-conv
describe('Testing "Grupo conversacion"', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();
  test('Testing correct "add" functionality', async () => {
    const request = mockRequest(
      {
        'nombre' : 'testing-input-1',
        'canales': [],
        'roles': []
      }
    );
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Testing incorrect (canales not in db) "add" functionality', async () => {
    const request = mockRequest(
      {
        'nombre' : 'testing-input-1',
        'canales': ['d1'],
        'roles': []
      }
    );
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: 'couldn\'t find canal with the given id',
    });
  });

  test('Testing incorrect (roles not in db) "add" functionality', async () => {
    const request = mockRequest(
      {
        'nombre' : 'testing-input-1',
        'canales': [],
        'roles': ['id1']
      }
    );
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: 'couldn\'t find role with the given id',
    });
  });
});

jest.clearAllMocks();
mockCollection.mockClear();
