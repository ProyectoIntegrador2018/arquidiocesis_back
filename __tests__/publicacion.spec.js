const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const publicacion = require('../routes/publicacion.js');

const mockRequest = (body, params) => ({
  body,
  params,
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
        channel_owner_id: '1',
      },
    ],
  },
});

describe('Publicacion functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('Testing correct add functionality', async () => {
    const req = mockRequest({
      post_text: 'dummy post text',
      post_author: '2',
      post_files: [],
      channel_owner_id: 1,
    });
    const res = mockResponse();

    await publicacion.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect add functionality: field in blank', async () => {
    const req = mockRequest({
      post_text: 'dummy post text',
      channel_owner_id: 1,
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

  test('Testing incorrect add functionality: no channel owner id', async () => {
    const req = mockRequest({
      post_text: 'dummy post text',
      post_author: '2',
      post_files: [],
    });
    const res = mockResponse();

    await publicacion.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: true,
        message: 'Channel owner ID should not be left blank',
      })
    );
  });

  test('Testing correct edit functionality', async () => {
    //Assuming get function has been called
    //the mock request contains the data resulted from get and 'modified' by frontend
    const req = mockRequest(
      {
        post_id: '1',
        post_text: 'This is a modified text for the dummy post',
        post_files: ['1', '2', '3'],
      },
      {}
    );
    const res = mockResponse();

    await publicacion.edit(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing correct get functionality', async () => {
    const req = mockRequest({}, { id: '1' });
    const res = mockResponse();

    await publicacion.get(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing correct get_post_files functionality', async () => {
    const req = mockRequest({
      post_id: '1',
    });
    const res = mockResponse();

    await publicacion.get_post_files(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: false,
        post_files: ['1', '2', '3'],
      })
    );
  });

  test('Testing correct delete functionality', async () => {
    const req = mockRequest({}, { id: '1' });
    const res = mockResponse();

    await publicacion.remove(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect delete functionality: no id in params', async () => {
    const req = mockRequest({}, { id: undefined });
    const res = mockResponse();

    await publicacion.remove(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: true })
    );
  });

  test('Testing correct getChannelPosts functionality', async () => {
    const req = mockRequest({}, { channelID: '1' });
    const res = mockResponse();

    await publicacion.getChannelPosts(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('publicacion');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});
