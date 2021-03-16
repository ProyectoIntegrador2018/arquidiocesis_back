const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const grupo = require('../routes/grupo-conv');

const mockRequest = (body) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.send.data = jest.fn();
  return res;
};

//Creating fake firebase database
mockFirebase({
  database: {
    grupo_conv: [
      {
        id: '1',
        group_name: 'testing1',
        group_channels: ['id1', 'id2', 'id3'],
        group_roles: ['rol1', 'rol2', 'rol3'],
      },
      {
        id: '2',
        group_name: 'testing2',
        group_channels: [],
        group_roles: ['rol1', 'rol2', 'rol3'],
      },
      {
        id: '3',
        group_name: 'testing3',
        group_channels: ['id1', 'id2', 'id3'],
        group_roles: [],
      },
      { id: '4', group_name: 'testing4', group_channels: [], group_roles: [] },
    ],
  },
});

//Creating test suite for grupo-conv
describe('Testing "Grupo conversacion"', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();
  test('Testing correct "add" functionality', async () => {
    const request = mockRequest({
      group_name: 'testing-input-1',
      group_channels: [],
      group_roles: {},
      group_description: '',
    });
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect (group_channels not in db) "add" functionality', async () => {
    const request = mockRequest({
      group_name: 'testing-input-1',
      group_channels: ['id1'],
      group_roles: {},
      group_description: '',
    });
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: "couldn't find canal with the given id",
      error_id: 'id1',
    });
  });

  test('Testing incorrect (group_roles not in db) "add" functionality', async () => {
    const request = mockRequest({
      group_name: 'testing-input-1',
      group_channels: [],
      group_roles: { administrator: ['id1'] },
      group_description: '',
    });
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: "couldn't find role with the given id",
      error_id: 'id1',
    });
  });

  test('Testing correct "edit" functionality', async () => {
    const request = mockRequest({
      group_id: '1',
      group_name: 'testing4',
      group_description: 'This is a new description',
    });
    const res = mockResponse();

    await grupo.edit(db, request, res);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});

jest.clearAllMocks();
mockCollection.mockClear();
