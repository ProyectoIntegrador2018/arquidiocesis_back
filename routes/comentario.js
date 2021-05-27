const admin = require('firebase-admin');
const util = require('./util');
/**
 * Module for managing Groups
 * @module Comentario
 */

/*
-- Comment ideal architecture --

author: user-id,
comment-text: string,
timestamp: Date,

*/

const add = async (firestore, req, res) => {
  const { comment_text, comment_author, post_owner_id } = req.body;

  if (post_owner_id === '' || post_owner_id === undefined) {
    return res.send({
      error: true,
      message: 'Post owner ID should not be left blank',
    });
  }

  if (
    comment_text === '' ||
    comment_text === undefined ||
    comment_author === '' ||
    comment_author === undefined
  ) {
    return res.send({
      error: true,
      message: 'Field cannot be left blank',
    });
  }

  try {
    const collectionref = await firestore.collection('comentario');
    const docref = await collectionref.add({
      comment_author,
      comment_text,
      creation_timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      post_owner_id,
    }); // add new comentario to comentario collection

    await firestore
      .collection('publicacion')
      .doc(post_owner_id)
      .update({
        post_comments: admin.firestore.FieldValue.arrayUnion(docref.id), // adding comment to publicacion comments array.
      });

    //Notification process
    const postRef = await firestore
      .collection('publicacion')
      .doc(post_owner_id);
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
      'Nuevo comentario',
      `/chat/post?id=${post_owner_id}`,
      'Se ha añadido un nuevo comentario a una publicación que sigues'
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

const getPostComments = async (firestore, req, res) => {
  const { postID } = req.params;
  if (postID === '' || postID === undefined) {
    return res.send({
      error: true,
      message: 'Field cannot be left blank',
    });
  }
  const snapshot = await firestore
    .collection('comentario')
    .where('post_owner_id', '==', postID)
    .get();

  try {
    return res.send({
      error: false,
      data: await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userSnapshot = await firestore
            .collection('users')
            .doc(doc.data().comment_author)
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

module.exports = {
  add,
  getPostComments,
};
