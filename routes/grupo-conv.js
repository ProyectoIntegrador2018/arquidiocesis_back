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
    group_roles, //should be an object as the above description implies.
    group_channels,
  } = req.body;

  for (const group_role in group_roles) {
    for (const role of group_roles[group_role]) {
      const roleref = await firestore.collection('roles').doc(role);
      //validate role
      const snapshot = await roleref.get();
      if (!snapshot.exists) {
        return res.send({
          error: true,
          message: 'couldn\'t find role with the given id',
          error_id: role,
        });
      }
    }
  }

  // Checks if all canales exist within collection 'canales'
  for (const channel of group_channels) {
    const channelref = await firestore.collection('canales').doc(channel);
    //validate channel
    const snapshot = await channelref.get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'couldn\'t find canal with the given id',
        error_id: channel,
      });
    }
  }

  const collectionref = await firestore.collection('grupo_conv');
  const docref = await collectionref.add({
    group_name,
    group_roles,
    group_channels,
  }); // add new grupo-conv to grupo-conv collection

  // --------- success ----------//
  // ----------VVVVVVV-----------//
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

const addUser = async (firestore, req, res) => {
  const { group_id, group_users } = req.body;
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        members: admin.firestore.FieldValue.arrayUnion(...group_users),
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

const removeUser = async (firestore, req, res) => {
  const { group_id, group_users } = req.body;
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        members: admin.firestore.FieldValue.arrayRemove(...group_users),
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

const getall = async (firestore, req, res) => {
  const snapshot = await firestore.collection('grupo_conv').get();
  try {
    const docs = snapshot.docs.map((doc) => {
      console.log(doc.id);
      return {
        id: doc.id,
        content: doc.data(),
      };
    });
    return res.send({
      error: false,
      data: docs,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

module.exports = {
  add: add,
  addUser: addUser,
  edit: edit,
  removeUser: removeUser,
  getall: getall,
};
