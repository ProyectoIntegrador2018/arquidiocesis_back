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
  const snapshot = (
    await firestore
      .collection('users')
      .where('__name__', 'in', group_users)
      .get()
  ).docs;
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
  await firestore
    .collection('users')
    .where('__name__', 'in', group_users)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        try {
          snapshot.forEach((doc) => {
            doc.ref.update({
              groups: admin.firestore.FieldValue.arrayUnion(group_id),
            });
          });
        } catch (e) {
          console.error(e);
          return false;
        }
      }
    });
  return true;
};

const removeGroupMembers = async (firestore, group_id, group_users) => {
  if (!group_id) return false;
  const snapshot = (
    await firestore
      .collection('grupo_conv')
      .where('__name__', 'in', group_users)
      .get()
  ).docs;
  if (snapshot.length > 0) {
    try {
      for (const s of snapshot) {
        await s.ref.update({
          groups: admin.firestore.FieldValue.arrayRemove(group_id),
        });
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return true;
};

module.exports = {
  removeRole,
  removeRoleMembers,
  addGroupMembers,
  removeGroupMembers,
  getAllUsers,
};
