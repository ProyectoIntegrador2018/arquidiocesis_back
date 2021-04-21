/**
 * Module for managing 'capacitaciones'
 * @module Roles
 */

/* roles ideal architecture

role-title: string
role-description: string
members: ['user-id-1', 'user-id-2', ... ]

*/
const admin = require('firebase-admin');

const add = async (firestore, req, res) => {
  const { role_title, role_description } = req.body;

  if (
    role_title === '' ||
    role_title === undefined ||
    role_description === '' ||
    role_description === undefined
  ) {
    return res.send({
      error: true,
      message: 'role_title should not be left blank',
    });
  }

  const new_role_entry = {
    title: role_title.toLowerCase(),
    role_description: role_description,
    members: [],
  };

  // check that current role_title is not already registered in roles
  await firestore
    .collection('roles')
    .where('role_title', '==', new_role_entry.title)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        return res.send({
          error: true,
          message: `Role title: ${new_role_entry.title} is already in use`,
          data: snapshot,
        });
      }
    });

  try {
    const collectionref = await firestore.collection('roles');
    const docref = await collectionref.add(new_role_entry); // add new role to roles collection
    return res.send({
      error: false,
      data: docref.id,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const getAllRoles = async (firestore, req, res) => {
  const dataRes = {};
  try {
    const rolesRef = await firestore.collection('roles');
    const snapshot = await rolesRef.get();
    snapshot.forEach((doc) => {
      dataRes[doc.id] = doc.data();
    });
    return res.send({
      error: false,
      roles: dataRes,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const addRoleMember = async (firestore, req, res) => {
  const roleDocId = req.params.id;
  const { new_role_members } = req.body;

  const docRef = await firestore.collection('roles').doc(roleDocId);

  try {
    docRef.update({
      members: admin.firestore.FieldValue.arrayUnion(...new_role_members),
    });
    res.send({
      error: false,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const remove = async (firestore, req, res) => {
  const { id } = req.params; //role ID

  if (id == null || id === '') {
    res.send({
      error: true,
      message: 'ID field required',
    });
  }

  try {
    await firestore.collection('roles').doc(id).delete();
    res.send({
      error: false,
      message: 'Role deleted succesfuly',
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const revoke = async (firestore, req, res) => {
  const { id } = req.params; //role ID
  const { users } = req.body; // user ID's

  if (id === '' || id == null) {
    res.send({
      error: true,
      message: 'ID field required',
    });
  }

  if (users === '' || users == null || users.length < 1) {
    res.send({
      error: true,
      message: 'USER_ID field required',
    });
  }

  const docRef = await firestore.collection('roles').doc(id);

  try {
    docRef.update({
      members: admin.firestore.FieldValue.arrayRemove(...users),
    });

    //Removes role from user document role array
    for (const user of users) {
      await firestore
        .collection('users')
        .doc(user)
        .update({
          roles: admin.firestore.FieldValue.arrayRemove(id),
        });
    }

    res.send({
      error: false,
      message: 'Role deleted succesfuly from users',
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

module.exports = {
  add,
  getAllRoles,
  addRoleMember,
  remove,
  revoke,
};
