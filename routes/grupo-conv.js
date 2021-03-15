const Util = require('./util');
/**
 * Module for managing Groups
 * @module Grupo-conv
 */

/*
Grupo conv ideal architecture:

 group-name : string,
 // roles adds permission hierarchy to groups
 // roles should only 2 values; administrator and member
 // roles is another collection within the database
 roles : hashtable of roles,
 eg. group-roles : {
   'group-administrators' : ['coordinator-parish-id-1', 'coordinator-zone-id-2'],
   'members' : ['member-parish-id-3', 'member-zone-id-4'],
 }
 // channels adds communication control to groups
 // channels must have at least 1 channels documents; #General channel is a must
 // channels is another collection within the database
 channels: hashtable of channels,
 eg. channels : {
   'general' : channel-general-id-1,
   'about' : channel-about-id-2,
 }
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