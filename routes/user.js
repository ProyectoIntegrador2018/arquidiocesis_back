const admin = require('firebase-admin');
/**
 * Module for managing Groups
 * @module User
 */

/*
User ideal architecture:
To define...

groups: [string], group_conv id's
roles: [string], roles id's

*/

// Divide array into chunks of the specified size
const chunks = function (array, size) {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};

const getAllUsers = async (firestore, req, res) => {
  const dataRes = {};
  try {
    const rolesRef = await firestore.collection('users');
    const snapshot = await rolesRef.get();
    snapshot.forEach((doc) => {
      dataRes[doc.id] = doc.data();
    });
    res.send({
      error: false,
      users: dataRes,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const removeRole = async (firestore, role_id, group_users) => {
  if (!role_id) return false;

  try {
    const groupUsersChunks = chunks(group_users, 10);
    for (const chunkGroupUsers of groupUsersChunks) {
      const snapshot = await firestore
        .collection('users')
        .where('__name__', 'in', chunkGroupUsers)
        .get();
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) =>
          doc.ref.update({
            roles: admin.firestore.FieldValue.arrayRemove(role_id),
          })
        );
      }
    }

    return true;
  } catch (e) {
    console.log(e);
    console.error(e);
    return false;
  }
};

const removeRoleMembers = async (firestore, role_id) => {
  if (!role_id) return false;
  const snapshot = (await firestore.collection('users').get()).docs;
  if (snapshot.length > 0) {
    try {
      for (const s of snapshot) {
        await s.ref.update({
          roles: admin.firestore.FieldValue.arrayRemove(role_id),
        });
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return true;
};

const addGroupMembers = async (firestore, group_id, group_users) => {
  if (!group_id) return false;

  try {
    const groupUsersChunks = chunks(group_users, 10);
    for (const chunkGroupUsers of groupUsersChunks) {
      const snapshot = await firestore
        .collection('users')
        .where('__name__', 'in', chunkGroupUsers)
        .get();
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) =>
          doc.ref.update({
            groups: admin.firestore.FieldValue.arrayUnion(group_id),
          })
        );
      }
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const removeGroupMembers = async (firestore, group_id, group_users) => {
  if (!group_id) return false;

  try {
    const groupUsersChunks = chunks(group_users, 10);
    for (const chunkGroupUsers of groupUsersChunks) {
      const snapshot = await firestore
        .collection('users')
        .where('__name__', 'in', chunkGroupUsers)
        .get();
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) =>
          doc.ref.update({
            groups: admin.firestore.FieldValue.arrayRemove(group_id),
          })
        );
      }
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

//Add information to current user
const addInformationToUser = async function (userEmail, data) {
  const usersRef = admin.firestore.collection('users');
  const snapshot = await usersRef.where('email', '==', userEmail).get();
  snapshot.forEach(async (doc) => {
    await usersRef.doc(doc.id).update(data);
  });
};

module.exports = {
  removeRole,
  removeRoleMembers,
  addGroupMembers,
  removeGroupMembers,
  getAllUsers,
  addInformationToUser,
};
