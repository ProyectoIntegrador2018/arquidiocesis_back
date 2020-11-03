let FieldValue = require('firebase-admin').firestore.FieldValue;
const moment = require('moment');
const Util = require('./util');

const getServicioMedico = async (firestore, req, res) => {
  var servicio_publico = await firestore.collection('miembros').where('ficha_medica.servicio_medico', '==', "Público").get().then(snap => { return snap.size; });

  var servicio_privado = await firestore.collection('miembros').where('ficha_medica.servicio_medico', '==', "Privado").get().then(snap => { return snap.size; });

  var ningun_servicio = await firestore.collection('miembros').where('ficha_medica.servicio_medico', '==', "Ninguno").get().then(snap => { return snap.size; });

  var total = servicio_publico + servicio_privado + ningun_servicio;

  res.send({
    error: false,
    publico: servicio_publico / total * 100,
    privado: servicio_privado / total * 100,
    ninguno: ningun_servicio / total * 100,
  })
}

module.exports = {
  getServicioMedico,
}