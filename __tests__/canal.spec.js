const { mockCollection } = require('firestore-jest-mock/mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');
const canal = require('../routes/canal');

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
    canal: [
      {
        id: '1',
        canal_name: 'testing1',
        canal_description: 'description1',
        group_publications: ['id1', 'id2', 'id3'],
      },
      {
        id: '2',
        canal_name: 'testing2',
        canal_description: 'description2',
        group_publications: [],
      },
      {
        id: '3',
        canal_name: 'testing3',
        canal_description: 'description3',
        group_publications: ['id4', 'id5'],
      },
      {
        id: '4',
        canal_name: 'testing4',
        canal_description: 'description4',
        group_publications: ['id6'],
      },
    ],
  },
});

//Creating test suite for canal
describe('Testing "Canal"', () => {
  const admin = require('firebase-admin');
  const db = admin.firestore();
  test('Testing correct "add" functionality', async () => {
    const request = mockRequest({
      canal_name: 'testing-input-1',
      canal_publications: [],
      canal_description: '',
    });
    const res = mockResponse();
    await canal.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });

  test('Testing incorrect (canal_publications not in db) "add" functionality', async () => {
    const request = mockRequest({
      canal_name: 'testing-input-1',
      canal_publications: ['id1'],
      canal_description: '',
    });
    const res = mockResponse();
    await canal.add(db, request, res);
    expect(res.send).toHaveBeenCalledWith({
      error: true,
      message: "couldn't find publication with the given id",
      error_id: 'id1',
    });
  });

  test('Testing correct "edit" functionality', async () => {
    const request = mockRequest({
      canal_id: '1',
      canal_name: 'testing5',
      canal_description: 'This is a new description',
    });
    const res = mockResponse();

    await canal.edit(db, request, res);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: false })
    );
  });
});

jest.clearAllMocks();
mockCollection.mockClear();
