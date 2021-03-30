const {
  mockCollection,
  mockDoc,
} = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const publicacion = require('../routes/publicacion.js');

const mockRequest = (body) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

//Creating fake firebase database with publicacion collection only
mockFirebase({
  database: {
    publicacion: [
      {
        id: '1',
        post_author: '1',
        post_text: 'dummy post text',
        post_files: ['1', '2', '3'],
      },
    ],
  },
});

describe('Publicacion functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('Testing add functionality', async () => {
    const req = mockRequest({
      post_text: 'dummy post text',
      post_author: '2',
      post_files: [],
    });
    const res = mockResponse();

    await publicacion.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect add functionality', async () => {
    const req = mockRequest({
      post_text: 'dummy post text',
    });
    const res = mockResponse();

    await publicacion.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: true,
        message: 'Field cannot be left blank',
      })
    );
  });

  test('Testing retrieve_post_files functionality', async () => {
    const req = mockRequest({
      post_id: '1',
    });
    const res = mockResponse();

    await publicacion.retrieve_post_files(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: false,
        post_files: ['1', '2', '3'],
      })
    );
  });
});
