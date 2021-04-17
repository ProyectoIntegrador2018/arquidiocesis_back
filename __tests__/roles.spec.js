const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const roles = require('../routes/roles.js');

const mockRequest = (body, id) => ({
  body,
  id,
});

const mockResponse = () => {
  const res = {};
  res.send = jest.fn().mockReturnValue(res);
  res.send.data = jest.fn();
  return res;
};

//Creating fake firebase database with logins collection only
mockFirebase({
  database: {
    roles: [{ id: '1', role_title: 'dummy_role_title', members: [] }],
  },
});

describe('Roles functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('Testing add functionality', async () => {
    const req = mockRequest({
      role_title: 'role_test_1',
    });
    const res = mockResponse();

    await roles.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect add functionality', async () => {
    const req = mockRequest({
      role_title: 'dummy_role_title',
    });
    const res = mockResponse();

    await roles.add(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: true,
        message: 'This title is already in use',
      })
    );
  });

  test('Testing getAllRoles functionality', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await roles.getAllRoles(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { 1: { members: [], role_title: 'dummy_role_title' } },
        error: false,
      })
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing addRoleMember functionality', async () => {
    const req = mockRequest(
      {
        new_role_members: ['dummy_memb_1', 'dummy_memb_2'],
      },
      1 // role doc id
    );
    const res = mockResponse();

    await roles.addRoleMember(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing correct delete functionality', async () => {
    const req = mockRequest({}, 1);
    const res = mockResponse();
    await roles.remove(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect delete functionality: no id in id', async () => {
    const req = mockRequest({}, { id: undefined });
    const res = mockResponse();

    await roles.remove(db, req, res);

    expect(mockCollection).toHaveBeenCalledWith('roles');
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: true })
    );
  });
});
