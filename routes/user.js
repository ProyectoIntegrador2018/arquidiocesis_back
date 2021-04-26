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
            if (doc.get('groups') != null) {
              doc.ref.update({
                groups: admin.firestore.FieldValue.arrayUnion(group_id),
              });
            } else {
              doc.ref.set({
                groups: admin.firestore.FieldValue.arrayUnion(group_id),
              });
            }
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
};
