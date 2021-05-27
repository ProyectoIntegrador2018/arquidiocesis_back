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
    const post = await firestore
      .collection('publicacion')
      .doc(post_owner_id)
      .get();
    const channel = await firestore
      .collection('canales')
      .doc(post.data().channel_owner_id)
      .get();
    const group = await firestore
      .collection('grupo_conv')
      .doc(channel.data().grupo_conv_owner_id)
      .get();

    await util.triggerNotification(
      group.exists
        ? [
          ...(group.data().group_admins ?? []),
          ...(group.data().group_members ?? []),
        ]
        : [],
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
