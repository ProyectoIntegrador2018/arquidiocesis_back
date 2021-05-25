const admin = require('firebase-admin');
const util = require('./util');
/**
 * Module for managing Groups
 * @module Publicacion
 */

/*
-- Post ideal architecture --

author: user-id,
post-text: string,
post-files: ['file-id-1', 'file-id-2', 'file-id-3'],
post-comments: ['comment-id-1', 'comment-id-2', 'comment-id-3'],

*/

const add = async (firestore, req, res) => {
  const { post_text, post_author, post_files, channel_owner_id } = req.body;

  if (channel_owner_id === '' || channel_owner_id === undefined) {
    return res.send({
      error: true,
      message: 'Channel owner ID should not be left blank',
    });
  }

  if (
    post_text === '' ||
    post_text === undefined ||
    post_author === '' ||
    post_author === undefined
  ) {
    return res.send({
      error: true,
      message: 'Field cannot be left blank',
    });
  }

  try {
    const collectionref = await firestore.collection('publicacion');
    const docref = await collectionref.add({
      post_author,
      post_text,
      post_files,
      creation_timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      channel_owner_id,
    }); // add new publicacion to publicacion collection

    //Notification process
    const channelRef = await firestore
      .collection('canales')
      .doc(channel_owner_id);
    const channel = await channelRef.get();
    const groupRef = await firestore
      .collection('grupo_conv')
      .doc(channel.grupo_conv_owner_id);
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
      'Se ha añadido una nueva publicacion',
      `/chat/post/${docref.id}`,
      'Una nueva publicacion ha sido añadida'
    );

    res.send({
      error: false,
      data: docref.id,
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const edit = async (firestore, req, res) => {
  const { post_id, post_text, post_files } = req.body;

  try {
    await firestore.collection('publicacion').doc(post_id).update({
      post_text,
      post_files,
    });

    //Notification process
    const postRef = await firestore.collection('publicacion').doc(post_id);
    const post = await postRef.get();
    const channelRef = await firestore
      .collection('canales')
      .doc(post.channel_owner_id);
    const channel = await channelRef.get();
    const groupRef = await firestore
      .collection('grupo_conv')
      .doc(channel.grupo_conv_owner_id);
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
      'Se ha modificado una publicacion que sigues',
      `/chat/channel/${post_id}`,
      'Se ha modificado una publicacion'
    );

    return res.send({
      error: false,
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const get = async (firestore, req, res) => {
  const { id } = req.params; //post ID

  try {
    const postRef = await firestore.collection('publicacion').doc(id);
    const post = await postRef.get();
    if (post.exists) {
      return res.send({
        error: false,
        data: {
          post: {
            id: post.id,
            ...post.data(),
          },
        },
      });
    }
    return res.send({
      error: true,
      message: `No post with ID: ${id}`,
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const getChannelPosts = async (firestore, req, res) => {
  const { channelID } = req.params;
  if (channelID === '' || channelID === undefined) {
    return res.send({
      error: true,
      message: 'Field cannot be left blank',
    });
  }
  const snapshot = await firestore
    .collection('publicacion')
    .where('channel_owner_id', '==', channelID)
    .get();

  try {
    return res.send({
      error: false,
      data: await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userSnapshot = await firestore
            .collection('users')
            .doc(doc.data().post_author)
            .get();
          return {
            id: doc.id,
            authorInfo: userSnapshot.data(),
            ...doc.data(),
          };
        })
      ),
    });
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

const remove = async (firestore, req, res) => {
  if (Object.keys(req.params).length === 0) {
    res.send({
      error: true,
      message: 'ID field required',
    });
  }
  const { id } = req.params; //post ID

  if (id === '' || id === undefined) {
    res.send({
      error: true,
      message: 'ID field required',
    });
  }

  try {
    await firestore.collection('publicacion').doc(id).delete();
    res.send({
      error: false,
      message: 'Post deleted succesfuly',
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

module.exports = {
  add: add,
  edit: edit,
  get: get,
  getChannelPosts: getChannelPosts,
  remove: remove,
};
