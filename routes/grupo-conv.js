const admin = require('firebase-admin');
const userUtil = require('./user');
const util = require('./util');
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
   'group_members' : ['member-parish-id-3', 'member-zone-id-4'],
 }
 // channels adds communication control to groups
 // channels must have at least 1 channels documents; #General channel is a must
 // channels is another collection within the database
 channels: array of channels,
 eg. channels : ['channel-general-id-1', 'channel-about-id-2']
*/

// Divide array into chunks of the specified size
const chunks = function (array, size) {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};

const add = async (firestore, req, res) => {
  let {
    group_name,
    group_admins, //should be an object as the above description implies.
    group_members,
    group_channels,
  } = req.body;

  if (group_admins === undefined) {
    group_admins = [];
  }

  if (group_members === undefined) {
    group_members = [];
  }

  // check that current grupo-conv name is not already registered
  firestore
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
    group_admins,
    group_members,
    group_channels,
  }); // add new grupo-conv to grupo-conv collection

  //Notification process
  const groupRef = await firestore.collection('grupo_conv').doc(docref.id);
  const group = await groupRef.get();
  let userIds = [];

  if (group.exists) {
    const group_admins =
      group.data().group_admins === undefined ||
      group.data().group_admins === null
        ? []
        : group.data().group_admins;
    const group_members =
      group.data().group_members === undefined ||
      group.data().group_members === null
        ? []
        : group.data().group_members;

    userIds = [...group_members, ...group_admins];
  }

  await util.triggerNotification(
    userIds,
    'Se ha creado un nuevo grupo',
    `/chat/group?id=${docref.id}`,
    `Se ha creado el grupo: ${group_name}`
  );
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

  //Notification process
  const groupRef = await firestore.collection('grupo_conv').doc(group_id);
  const group = await groupRef.get();
  let userIds = [];

  if (group.exists) {
    const group_admins =
      group.data().group_admins === undefined ||
      group.data().group_admins === null
        ? []
        : group.data().group_admins;
    const group_members =
      group.data().group_members === undefined ||
      group.data().group_members === null
        ? []
        : group.data().group_members;

    userIds = [...group_members, ...group_admins];
  }

  await util.triggerNotification(
    userIds,
    'Se ha modificado un grupo',
    `/chat/group?id=${group_id}`,
    `Se ha modificado el grupo: ${group_name}`
  );

  return res.send({
    error: false,
  });
};

const addAdmin = async (firestore, req, res) => {
  const { group_id, administrators } = req.body;
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        administrators: admin.firestore.FieldValue.arrayUnion(
          ...administrators
        ),
      });
    userUtil.addGroupMembers(firestore, group_id, administrators);
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

const addMember = async (firestore, req, res) => {
  const { group_id, group_members } = req.body;
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        group_members: admin.firestore.FieldValue.arrayUnion(...group_members),
      });
    userUtil.addGroupMembers(firestore, group_id, group_members);
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
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        administrators: admin.firestore.FieldValue.arrayRemove(
          ...administrators
        ),
      });
    userUtil.removeGroupMembers(firestore, group_id, administrators);
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
  const { group_id, group_members } = req.body;
  try {
    await firestore
      .collection('grupo_conv')
      .doc(group_id)
      .update({
        group_members: admin.firestore.FieldValue.arrayRemove(...group_members),
      });
    userUtil.removeGroupMembers(firestore, group_id, group_members);
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
  const { id } = req.params; //get users' id
  try {
    const userRef = await firestore.collection('users').doc(id);
    const user = await userRef.get();

    if (user.exists) {
      const groups = [];
      const groupIds = user.data().groups;
      const groupIdsChunks = chunks(groupIds, 10);
      for (const chunkIds of groupIdsChunks) {
        const groupsRef = firestore.collection('grupo_conv');
        const snapshot = await groupsRef
          .where('__name__', 'in', chunkIds)
          .get();
        if (!snapshot.empty) {
          snapshot.docs.forEach((doc) =>
            groups.push({ id: doc.id, ...doc.data() })
          );
        }
      }

      return res.send({
        error: false,
        groups: groups,
      });
    }
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const getAllGroupUsers = async (firestore, req, res) => {
  const { id } = req.body; //gets group id from body
  let dataRes = [];
  try {
    const groupRef = await firestore.collection('grupo_conv').doc(id);
    const group = await groupRef.get();
    if (group.exists) {
      //checks for user id in users collection

      const group_admins =
        group.data().group_admins === undefined ||
        group.data().group_admins === null
          ? []
          : group.data().group_admins;
      const group_members =
        group.data().group_members === undefined ||
        group.data().group_members === null
          ? []
          : group.data().group_members;

      const userIds = [...group_members, ...group_admins];
      const awaitResults = userIds.map((id) =>
        firestore.collection('users').doc(id).get()
      );
      dataRes = await Promise.all(awaitResults);
      dataRes = dataRes.map((drItem) => ({
        id: drItem.id,
        ...drItem.data(),
      }));
      return res.send({
        error: false,
        users: dataRes,
      });
    } else {
      return res.send({
        error: true,
        message: `No group with ID: ${id}`,
      });
    }
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const deleteGrupoConv = async (firestore, req, res) => {
  const { group_ids } = req.body;
  try {
    const snapshot = (
      await firestore
        .collection('grupo_conv')
        .where('__name__', 'in', group_ids)
        .get()
    ).docs;

    await Promise.all(snapshot.map(async (s) => s.ref.delete()));
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error in deleteGrupoConv: ${e}`,
    });
  }

  return res.send({
    error: false,
  });
};

module.exports = {
  add: add,
  addAdmin: addAdmin,
  addMember: addMember,
  edit: edit,
  removeAdmin: removeAdmin,
  removeMember: removeMember,
  getAllGroupsByUser: getAllGroupsByUser,
  getAllGroupUsers: getAllGroupUsers,
  deleteGrupoConv: deleteGrupoConv,
};
