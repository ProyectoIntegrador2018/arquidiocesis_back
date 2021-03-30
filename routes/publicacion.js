const Util = require('./util');
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
  const { post_text, post_author, post_files } = req.body;

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

  const collectionref = await firestore.collection('publicacion');
  const docref = await collectionref.add({
    post_text,
    post_author,
    post_files,
  }); // add new publicacion to publicacion collection

  // --------- success ----------//
  // ----------VVVVVVV-----------//
  res.send({
    error: false,
    data: docref.id,
  });
};

const edit = async (firestore, req, res) => {
  const { post_id, post_text, post_files } = req.body;

  await firestore.collection('publicacion').doc(post_id).update({
    post_text,
    post_files,
  });

  // --------- success ----------//
  // ----------VVVVVVV-----------//
  return res.send({
    error: false,
  });
};

const get_files = async (firestore, req, res) => {
  const { post_id } = req.body;

  await firestore
    .collection('publicacion')
    .doc(post_id)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        return res.send({
          error: false,
          post_files: snapshot.data()['post_files'],
        });
      }
    });
};

module.exports = {
  add: add,
  edit: edit,
  retrieve_post_files: get_files,
};
