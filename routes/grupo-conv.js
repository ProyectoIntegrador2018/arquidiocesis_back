const Util = require('./util');
const canal = require('./canal');
const admin = require('firebase-admin');
/**
 * Module for managing Groups
 * @module Grupo-conv
 */

/*
Grupo conv ideal architecture:

 group-name : string,
 group-desription: string,
 // roles adds permission hierarchy to groups
 // roles should only 2 values; administrator and member
 // roles is another collection within the database
 roles : hashtable of roles,
 eg. group-roles : {
   'group-administrators' : ['coordinator-parish-id-1', 'coordinator-zone-id-2'],
   'members' : ['member-parish-id-3', 'member-zone-id-4'],
 }
 // channels adds communication control to groups
 // channels must have at least 1 channels documents; #General channel is a must
 // channels is another collection within the database
 channels: array of channels,
 eg. channels : ['channel-general-id-1', 'channel-about-id-2']
*/

const add = async (firestore, req, res) => {
  const {
    group_name,
    group_admin, //should be an object as the above description implies.
    group_members,
    group_channels,
  } = req.body;

  // check that current grupo-conv name is not already registered
  await firestore
    .collection('grupo_conv')
    .where('group_name', '==', group_name)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        return res.send({
          error: true,
          message: 'This title is already in use',
        });
      }
    });

  const collectionref = await firestore.collection('grupo_conv');
  const docref = await collectionref.add({
    group_name,
    group_admin,
    group_members,
    group_channels,
  }); // add new grupo-conv to grupo-conv collection

  return res.send({
    error: false,
    data: docref.id,
  });
};

const edit = async (firestore, req, res) => {
  const { group_id, group_name, group_description } = req.body;

  await firestore.collection('grupo_conv').doc(group_id).update({
    group_name,
    group_description,
  });

  return res.send({
    error: false,
  });
};

const addAdmin = async (firestore, req, res) => {
  const { group_id, administrators} = req.body;
  try{
    await firestore.collection('grupo_conv').doc(group_id).update({
      administrators: admin.firestore.FieldValue.arrayUnion(...administrators),
    });

    return res.send({
      error: false,
    });

  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
}

const addMember = async (firestore, req, res) => {
  const { group_id, members } = req.body;
  try{
    await firestore.collection('grupo_conv').doc(group_id).update({
      members: admin.firestore.FieldValue.arrayUnion(...members),
    });

    return res.send({
      error: false,
    });

  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const removeAdmin = async (firestore, req, res) => {
  const { group_id, administrators } = req.body;
  try{
    await firestore.collection('grupo_conv').doc(group_id).update({
      administrators: admin.firestore.FieldValue.arrayRemove(...administrators),
    });

    return res.send({
      error: false,
    });

  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const removeMember = async (firestore, req, res) => {
  const { group_id, members } = req.body;
  try{
    await firestore.collection('grupo_conv').doc(group_id).update({
      members: admin.firestore.FieldValue.arrayRemove(...members),
    });

    return res.send({
      error: false,
    });

  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const getAllGroupsByUser = async (firestore, req, res) => {
  const { id } = req.body; //get users' id
  let dataRes = [];
  try {
    const userRef = await firestore.collection('users').doc(id);
    const user = await userRef.get();

    if(user.exists){
      const groupIds = user.data().groups;
      const groupsRef = firestore.collection('grupo-conv');
      const snapshot = await groupsRef.where('uid', 'in', groupIds).get();
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          dataRes.push(doc.data());
        });
      }
      return res.send({
        error: false,
        users: dataRes,
      });
    }
  } catch (err) {
    res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

module.exports = {
  add: add,
  addAdmin: addAdmin,
  addMember: addMember,
  edit: edit,
  removeAdmin: removeAdmin,
  removeMember: removeMember,
  getAllGroupsByUser: getAllGroupsByUser,
};


