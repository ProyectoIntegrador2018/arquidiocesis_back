/**
 * Module for managing 'capacitaciones'
 * @module Roles
 */

const admin = require('firebase-admin');


const add = async (firestore, req, res) => {
  const {
    role_title
  } = req.body;

  if(role_title === undefined || role_title === ''){
    return res.send({
      error: true,
      message: 'role_title is invalid',
    });
  }

  const new_role_entry = {
    title: role_title.toLowerCase(),
    members: []
  };

  // check that current role_title is not already registered
  const query = await firestore.collection('roles').where('role_title', '==', new_role_entry.title)
    .get().then( snapshot => {
      if (!snapshot.empty){
        return res.send({
          error: true,
          message: 'This title is already in use',
          data: snapshot,
        });
      };
    });

  try{
    const collectionref = await firestore.collection('roles');
    const docref = await collectionref.add(new_role_entry); // add new role to roles collection
    // --------- success ----------//
    // ----------VVVVVVV-----------//
    res.send({
      error: false,
      data: docref.id
    });
  } catch(e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const getAllRoles = async (firestore, req, res) => {
  let dataRes = {};
  try{
    const rolesRef = await firestore.collection('roles');
    const snapshot = await rolesRef.get();
    snapshot.forEach(doc => {
      dataRes[doc.id] = doc.data();
    });
    res.send({
      error: false,
      data: dataRes,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const addRoleMember = async (firestore, req, res) => {
  const roleDocId = req.id;
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



module.exports = {
  add,
  getAllRoles,
  addRoleMember,
};