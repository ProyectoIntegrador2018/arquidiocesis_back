let FieldValue = require('firebase-admin').firestore.FieldValue;
const moment = require('moment');
const Util = require('./util');

const getEstadisticas = async (firestore, req, res) => {

  var servicio = {
    publico: 0,
    privado: 0,
    ninguno: 0
  }

  var seguridadSocial = {
    pensionado: 0,
    jubilado: 0,
    apoyo_federal: 0,
    ninguno: 0
  }

  var alergico = 0;
  var problema_cardiovascular = 0;
  var problema_azucar = 0;
  var problema_hipertension = 0;
  var problema_sobrepeso = 0;

  var discapacidad = 0;

  var total = 0;

  var miembros = await firestore.collection('miembros').get();
  miembros.forEach(miembro => {
    var mdata = miembro.data();
    total++;

    // Checking servicio medico
    var ficha_medica = mdata.ficha_medica;
    if(ficha_medica == undefined) return;

    var mservicio = ficha_medica.servicio_medico;
    if(mservicio == "Público") servicio.publico++;
    else if(mservicio == "Privado") servicio.privado++;
    else if(mservicio == "Ninguno") servicio.ninguno++;

    //Checking alergico
    if(ficha_medica.alergico == true) alergico++;

    // Checking problema cardiovascular
    if(ficha_medica.p_cardiovascular == true) problema_cardiovascular++;

    // Checking problema de azucar
    if(ficha_medica.p_azucar == true) problema_azucar++;

    // Checking problema hipertension
    if(ficha_medica.p_hipertension == true) problema_hipertension++;

    // Checking problema sobrepeso
    if(ficha_medica.p_sobrepeso == true) problema_sobrepeso++;

    // Checking discapacidad
    if(ficha_medica.discapacidad == true) discapacidad++;

    // Checking seguridad social
    var mSeguridad = ficha_medica.seguridad_social;
    if(mSeguridad == "Ninguno") seguridadSocial.ninguno++;
    else if(mSeguridad == "Pensionado") seguridadSocial.pensionado++;
    else if(mSeguridad == "Jubilado") seguridadSocial.jubilado++;
    else if(mSeguridad == "Apoyo Federal") seguridadSocial.apoyo_federal++;
  })

  res.send({
    error: false,
    servicio_medico: {
      publico: servicio.publico / total * 100,
      privado: servicio.privado / total * 100,
      ninguno: servicio.ninguno / total * 100,
    },
    alergico: alergico / total * 100,
    p_cardiovascular: problema_cardiovascular / total * 100,
    p_azucar: problema_azucar / total * 100,
    p_hipertension: problema_hipertension / total * 100,
    p_sobrepeso: problema_sobrepeso / total * 100,
    discapacidad: discapacidad / total * 100,
    seguridad_social: {
      pensionado: seguridadSocial.pensionado / total * 100,
      jubilado: seguridadSocial.jubilado / total * 100,
      apoyo_federal: seguridadSocial.apoyo_federal / total * 100,
      ninguno: seguridadSocial.ninguno / total * 100
    }
  })
}

module.exports = {
  getEstadisticas,
}