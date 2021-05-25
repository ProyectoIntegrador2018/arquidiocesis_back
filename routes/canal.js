const admin = require('firebase-admin');
const util = require('./util');
/**
 * Module for managing Groups
 * @module Canal
 */

/*
Canal ideal architecture:

name : string
description : string
publications :  [strings]

 // publications are the message that the memebers of the group that has
 // the channel post. The publications are the way that communication between 
 // group members flow.

 publications : list of publications ids,
 eg. canal-publications : {
   'publication_ids' : ['1', '2'],
 }
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
  const {
    canal_name,
    canal_description, //should be an object as the above description implies.
    canal_publications,
    grupo_conv_owner_id,
  } = req.body;

  // Checks if all publication exist within collection 'publicaciones'
  for (const publication of canal_publications) {
    const publicationref = await firestore
      .collection('publicaciones')
      .doc(publication);
    //validate channel
    const snapshot = await publicationref.get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'couldn\'t find publication with the given id',
        error_id: publication,
      });
    }
  }

  const collectionref = await firestore.collection('canales');
  const docref = await collectionref.add({
    canal_name,
    canal_description,
    canal_publications,
    grupo_conv_owner_id,
  }); // add new channel to canales collection

  await firestore
    .collection('grupo_conv')
    .doc(grupo_conv_owner_id)
    .update({
      group_channels: admin.firestore.FieldValue.arrayUnion(docref.id), // adding channel to group comments array.
    });

  //Notification process
  const groupRef = await firestore
    .collection('grupo_conv')
    .doc(grupo_conv_owner_id);
  const group = await groupRef.get();
  let userIds = [];

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

    userIds = [...group_members, ...group_admins];
  }

  await util.triggerNotification(
    userIds,
    'Se ha creado un nuevo canal',
    `/chat/channel/${docref.id}`,
    `Se ha creado el canal: ${canal_name}`
  );

  res.send({
    error: false,
    data: docref.id,
  });
};

const edit = async (firestore, req, res) => {
  const { canal_id, canal_name, canal_description } = req.body;

  await firestore.collection('canales').doc(canal_id).update({
    canal_name,
    canal_description,
  });

  return res.send({
    error: false,
  });
};

const getAllChannelsByGroup = async (firestore, req, res) => {
  const { channel_ids } = req.body;

  const channelIdsChunks = chunks(channel_ids, 10);
  const channels = [];

  for (const chunkIds of channelIdsChunks) {
    const canalesRef = firestore.collection('canales');
    const snapshot = await canalesRef.where('__name__', 'in', chunkIds).get();
    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) =>
        channels.push({ id: doc.id, ...doc.data() })
      );
    }
  }

  return res.send({
    error: false,
    channels: channels,
  });
};

const deleteChannels = async (firestore, req, res) => {
  const { channel_ids } = req.body;
  try {
    const snapshot = (
      await firestore
        .collection('canales')
        .where('__name__', 'in', channel_ids)
        .get()
    ).docs;

    await Promise.all(snapshot.map(async (s) => s.ref.delete()));
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error in deleteChannels: ${e}`,
    });
  }

  return res.send({
    error: false,
  });
};

module.exports = {
  add: add,
  edit: edit,
  getAllChannelsByGroup: getAllChannelsByGroup,
  deleteChannels: deleteChannels,
};
