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

const add = async (firestore, req, res) => {
  const {
    canal_name,
    canal_description, //should be an object as the above description implies.
    canal_publications,
  } = req.body;

  // Checks if all publication exist within collection 'publicaciones'
  for (publication of canal_publications) {
    const publicationref = await firestore
      .collection('publicaciones')
      .doc(publication);
    //validate channel
    const snapshot = await publicationref.get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: "couldn't find publication with the given id",
        error_id: publication,
      });
    }
  }

  const collectionref = await firestore.collection('canales');
  const docref = await collectionref.add({
    canal_name,
    canal_description,
    canal_publications,
  }); // add new channel to canales collection

  // --------- success ----------//
  // ----------VVVVVVV-----------//
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
  const {channel_ids} = req.body;

  const canalesRef = firestore.collection('canales');
  const snapshot = await canalesRef.where('__name__', 'in', channel_ids).get();
  return res.send({
    error: false,
    channels: snapshot.docs.map(doc => doc.data()),
  });
}

module.exports = {
  add: add,
  edit: edit,
  getAllChannelsByGroup: getAllChannelsByGroup,
};
