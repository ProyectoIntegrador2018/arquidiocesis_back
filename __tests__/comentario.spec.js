const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const comentario = require('../routes/comentario.js');

const mockRequest = (body, params) => ({
  body,
  params,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

//Creating fake firebase database with comentario collection only
mockFirebase({
  database: {
    comentario: [
      {
        id: '1',
        comment_author: '1',
        comment_text: 'dummy comment text',
        post_owner_id: '1',
      },
      {
        id: '2',
        comment_author: '1',
        comment_text: 'dummy comment text',
        post_owner_id: '1',
      },
    ],
  },
});

describe('Comentario functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('Testing correct add functionality', async () => {
    const req = mockRequest({
      comment_text: 'dummy comentario text',
      comment_author: '2',
      post_owner_id: '1',
    });
    const res = mockResponse();

    await comentario.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('comentario');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect add functionality: field in blank', async () => {
    const req = mockRequest({
      comment_text: 'dummy comment text',
      post_owner_id: '1',
    });
    const res = mockResponse();

    await comentario.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('comentario');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: true,
        message: 'Field cannot be left blank',
      })
    );
  });

  test('Testing incorrect add functionality: no post owner id', async () => {
    const req = mockRequest({
      comment_text: 'dummy comment text',
      comment_author: '2',
    });
    const res = mockResponse();

    await comentario.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('comentario');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: true,
        message: 'Post owner ID should not be left blank',
      })
    );
  });

  test('Testing correct getPostComments functionality', async () => {
    const req = mockRequest({}, { postID: '1' });
    const res = mockResponse();

    await comentario.getPostComments(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('comentario');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});
