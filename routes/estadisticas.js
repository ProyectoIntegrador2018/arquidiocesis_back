let FieldValue = require('firebase-admin').firestore.FieldValue
const moment = require('moment')
const Util = require('./util')

const getEstadisticas = async (firestore, req, res) => {
  var servicio = {
    publico: 0,
    privado: 0,
    ninguno: 0,
  }

  var seguridadSocial = {
    pensionado: 0,
    jubilado: 0,
    apoyo_federal: 0,
    ninguno: 0,
  }

  var alergico = 0
  var lista_alergias = []
  var problema_cardiovascular = 0
  var problema_azucar = 0
  var problema_hipertension = 0
  var problema_sobrepeso = 0
  var ningun_problema = 0

  var discapacidad = 0
  var lista_discapacidad = []

  var escolaridad = {
    ninguno: 0,
    primaria: 0,
    secundaria: 0,
    preparatoria: 0,
    carrera_tecnica: 0,
    profesional: 0,
  }

  var total = 0

  var miembros = await firestore.collection('miembros').get()
  miembros.forEach((miembro) => {
    var mdata = miembro.data()
    total++

    // Checking servicio medico
    var ficha_medica = mdata.ficha_medica
    if (ficha_medica == undefined) return

    var mservicio = ficha_medica.servicio_medico
    if (mservicio == 'Público') servicio.publico++
    else if (mservicio == 'Privado') servicio.privado++
    else if (mservicio == 'Ninguno') servicio.ninguno++

    //Checking alergico
    if (ficha_medica.alergico == true) {
      alergico++
      lista_alergias.push(ficha_medica.alergico_desc)
    }

    // Checking problema cardiovascular
    if (ficha_medica.p_cardiovascular == true) problema_cardiovascular++

    // Checking problema de azucar
    if (ficha_medica.p_azucar == true) problema_azucar++

    // Checking problema hipertension
    if (ficha_medica.p_hipertension == true) problema_hipertension++

    // Checking problema sobrepeso
    if (ficha_medica.p_sobrepeso == true) problema_sobrepeso++

    // Checking ningun problema de salud
    if (
      ficha_medica.p_cardiovascular == false &&
      ficha_medica.p_azucar == false &&
      ficha_medica.p_hipertension == false &&
      ficha_medica.p_sobrepeso == false
    )
      ningun_problema++

    // Checking discapacidad
    if (ficha_medica.discapacidad == true) {
      discapacidad++
      lista_discapacidad.push(ficha_medica.discapacidad_desc)
    }

    // Checking seguridad social
    var mSeguridad = ficha_medica.seguridad_social
    if (mSeguridad == 'Ninguno') seguridadSocial.ninguno++
    else if (mSeguridad == 'Pensionado') seguridadSocial.pensionado++
    else if (mSeguridad == 'Jubilado') seguridadSocial.jubilado++
    else if (mSeguridad == 'Apoyo Federal') seguridadSocial.apoyo_federal++

    // Checking escolaridad
    var mEscolaridad = mdata.escolaridad
    if (mEscolaridad == 'Ninguno') escolaridad.ninguno++
    else if (mEscolaridad == 'Primaria') escolaridad.primaria++
    else if (mEscolaridad == 'Secundaria') escolaridad.secundaria++
    else if (mEscolaridad == 'Preparatoria') escolaridad.preparatoria++
    else if (mEscolaridad == 'Carrera Técnica') escolaridad.carrera_tecnica++
    else if (mEscolaridad == 'Profesional') escolaridad.profesional++
  })

  res.send({
    error: false,
    total: total,
    servicio_medico: {
      publico: (servicio.publico / total) * 100,
      privado: (servicio.privado / total) * 100,
      ninguno: (servicio.ninguno / total) * 100,
    },
    alergico: (alergico / total) * 100,
    alergico_desc: lista_alergias,
    p_cardiovascular: problema_cardiovascular,
    p_azucar: problema_azucar,
    p_hipertension: problema_hipertension,
    p_sobrepeso: problema_sobrepeso,
    p_ninguno: ningun_problema,
    discapacidad: (discapacidad / total) * 100,
    discapacidad_desc: lista_discapacidad,
    seguridad_social: {
      pensionado: (seguridadSocial.pensionado / total) * 100,
      jubilado: (seguridadSocial.jubilado / total) * 100,
      apoyo_federal: (seguridadSocial.apoyo_federal / total) * 100,
      ninguno: (seguridadSocial.ninguno / total) * 100,
    },
    escolaridad: {
      ninguno: (escolaridad.ninguno / total) * 100,
      primaria: (escolaridad.primaria / total) * 100,
      secundaria: (escolaridad.secundaria / total) * 100,
      preparatoria: (escolaridad.preparatoria / total) * 100,
      carrera_tecnica: (escolaridad.carrera_tecnica / total) * 100,
      profesional: (escolaridad.profesional / total) * 100,
    },
  })
}

module.exports = {
  getEstadisticas,
}
