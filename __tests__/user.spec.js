const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const user = require('../routes/user.js');

const mockRequest = (users) => ({
  users,
});

const members_test = ['1', '2', '3'];
const group_test = ['1'];

//Creating fake firebase database with logins collection only
mockFirebase({
  database: {
    roles: [
      { id: '1', role_title: 'dummy_role_title', members: ['1', '2'] },
      { id: '2', role_title: 'dummy_role_title', members: ['2'] },
    ],
    users: [
      { id: '1', name: 'user-1', roles: ['1', '2'] },
      { id: '2', name: 'user-2', roles: ['1'] },
      { id: '3', name: 'user-3', roles: [] },
    ],
  },
});

describe('User functionalities test suite', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  test('Testing revoke role membership', async () => {
    const req = mockRequest({
      users: ['1'],
    });

    const res = await user.removeRole(db, 1, req);

    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(res).toBe(true);
  });

  test('Testing revoke role membership without role id', async () => {
    const req = mockRequest({
      users: [1],
    });

    const res = await user.removeRole(db, null, req);

    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(res).toBe(false);
  });

  test('Testing revoke role membership for all users', async () => {
    const res = await user.removeRole(db, 1);
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(res).toBe(true);
  });

  test('Testing addGroupMembers', async () => {
    const res = await user.addGroupMembers(db, group_test, members_test);
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(res).toBe(true);
  });
});
