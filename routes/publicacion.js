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

  const today_date = new Date();
  const creation_timestamp =
    today_date.getFullYear() +
    '-' +
    (today_date.getMonth() + 1) +
    '-' +
    today_date.getDate();

  try {
    const collectionref = await firestore.collection('publicacion');
    const docref = await collectionref.add({
      post_author,
      post_text,
      post_files,
      creation_timestamp,
    }); // add new publicacion to publicacion collection

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

const get_post_files = async (firestore, req, res) => {
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
  get: get,
  get_post_files: get_post_files,
  remove: remove,
};
