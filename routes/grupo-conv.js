const Util = require('./util');
/**
 * Module for managing Groups
 * @module Grupo-conv
 */

const add = async (firestore, req, res) => {
  const {
    nombre,
    roles,
    canales,
  } = req.body;

  const snapshot_roles = [];

  // Checks if all roles exist within collection 'roles'
  for(role of roles){
    const roleref = await firestore.collection('roles').doc(role);
    //validate role
    const snapshot = await roleref.get();
    if (!snapshot.exists){
      return res.send({
        error: true,
        message: 'couldn\'t find role with the given id'
      });
    }
    snapshot_roles.add(snapshot.id);
  }

  const snapshot_canales = [];

  // Checks if all canales exist within collection 'canales'
  for(canal of canales){
    const canalref = await firestore.collection('canales').doc(canales);
    //validate canal
    const snapshot = await canalref.get();
    if (!snapshot.exists){
      return res.send({
        error: true,
        message: 'couldn\'t find canal with the given id'
      });
    }
    snapshot_canales.add(snapshot.id);
  }

  const collectionref = await firestore.collection('grupo-conv');
  const docref = await collectionref.add({
    nombre,
    roles: snapshot_roles,
    canales: snapshot_canales
  }); // add new grupo-conv to grupo-conv collection
   
  // --------- success ----------//
  // ----------VVVVVVV-----------//
  res.status(200).send({
    error: false,
    data: docref.id
  });
};

module.exports = {
  add: add
};