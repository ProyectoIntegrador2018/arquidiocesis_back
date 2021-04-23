const Util = require('./util');
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

  const today_date = new Date();
  const creation_timestamp =
    today_date.getFullYear() +
    '-' +
    (today_date.getMonth() + 1) +
    '-' +
    today_date.getDate();

  try {
    const collectionref = await firestore.collection('comentario');
    const docref = await collectionref.add({
      comment_author,
      comment_text,
      creation_timestamp,
      post_owner_id,
    }); // add new comentario to comentario collection

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
  const { post_owner_id } = req.body;
  if (post_owner_id === '' || post_owner_id === undefined) {
    return res.send({
      error: true,
      message: 'Field cannot be left blank',
    });
  }
  const snapshot = await firestore
    .collection('comentario')
    .where('post_owner_id', '==', req.body.post_owner_id)
    .get();
  try {
    const docs = snapshot.docs.map((doc) => {
      return {
        post_owner_id: post_owner_id,
        comment_id: doc.id,
        comments: doc.data(),
      };
    });
    return res.send({
      error: false,
      data: docs,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: `Unexpected error: ${e}`,
    });
  }
};

module.exports = {
  add: add,
  getPostComments: getPostComments,
};
