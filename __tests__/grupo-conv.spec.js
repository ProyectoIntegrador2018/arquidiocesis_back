const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const grupo = require('../routes/grupo-conv');

const mockRequest = (body, params) => ({
  body,
  params,
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
        group_admins: ['1'],
        group_members: ['2', '3'],
      },
      {
        id: '2',
        group_name: 'testing2',
        group_channels: [],
        group_admins: ['1'],
        group_members: ['2', '3'],
      },
      {
        id: '3',
        group_name: 'testing3',
        group_channels: ['id1', 'id2', 'id3'],
        group_admins: ['1'],
        group_members: ['2', '3'],
      },
      {
        id: '4',
        group_name: 'testing4',
        group_channels: [],
        group_admins: ['1'],
        group_members: ['2', '3'],
      },
    ],
    users: [
      {
        id: '1',
        name: 'user-1',
        groups: ['1', '2', '3'],
      },
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
      group_admins: [],
      group_members: [],
      group_description: '',
    });
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect "add" functionality', async () => {
    const request = mockRequest({
      group_name: 'testing1',
      group_channels: [],
      group_admins: [],
      group_members: [],
      group_description: '',
    });
    const res = mockResponse();
    await grupo.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: 'This title is already in use',
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

  test('Testing correct "getAllGroupsByUser" functionality', async () => {
    const request = mockRequest({}, { id: '1' });
    const res = mockResponse();

    await grupo.getAllGroupsByUser(db, request, res);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing addAdmin functionality', async () => {
    const req = mockRequest(
      {
        administrators: ['1', '2'],
        group_id: 1,
      } // role doc id
    );
    const res = mockResponse();

    await grupo.addAdmin(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('grupo_conv');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing addMember functionality', async () => {
    const req = mockRequest(
      {
        members: ['1', '2'],
        group_id: 1,
      } // role doc id
    );
    const res = mockResponse();

    await grupo.addMember(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('grupo_conv');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing removeAdmin functionality', async () => {
    const req = mockRequest(
      {
        administrators: ['1'],
        group_id: '1',
      } // role doc id
    );
    const res = mockResponse();

    await grupo.removeAdmin(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('grupo_conv');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing removeMember functionality', async () => {
    const req = mockRequest(
      {
        members: ['1'],
        group_id: '1',
      } // role doc id
    );
    const res = mockResponse();

    await grupo.removeMember(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('grupo_conv');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});

jest.clearAllMocks();
mockCollection.mockClear();
