/**
 * Module for managing Parishes
 * @module Parroquia
 */

const Util = require('./util');

/**
 * Retrieves all parishes from the 'parroquias´' collection
 */
const getall = async (firestore, req, res) => {
  const snapshot = await firestore.collection('parroquias').get();
  try {
    const docs = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        nombre: doc.data().nombre,
      };
    });
    res.send({
      error: false,
      data: docs,
    });
  } catch (err) {
    res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Retrieves an specific parish from the 'parroquias´' collection
 */
const getone = async (firestore, req, res) => {
  const snapshot = await firestore
    .collection('parroquias')
    .doc(req.params.id)
    .get();
  //validate parroquia
  if (!snapshot.exists) {
    return res.send({
      error: true,
      message: 'No parroquia with that ID.',
    });
  }
  var parroquia = snapshot.data();
  var capillas = [];
  // Conseguir información sobre capillas.
  var cap = await firestore
    .collection('capillas')
    .where('parroquia', '==', snapshot.id)
    .get();
  cap.forEach((a) => {
    if (!a.exists) return;
    capillas.push({ ...a.data(), id: a.id });
  });

  // Conseguir información sobre el decanato
  if (parroquia.decanato) {
    const dec = await firestore.doc('decanatos/' + parroquia.decanato).get();
    if (dec.exists)
      parroquia.decanato = {
        nombre: dec.data().nombre,
        id: dec.id,
      };
    else parroquia.decanato = null;
  }
  res.send({
    error: false,
    data: {
      id: snapshot.id,
      ...parroquia,
      capillas,
    },
  });
};

/**
 * Adds a new parish to the 'parroquias' collection
 */
const add = async (firestore, req, res) => {
  const {
    identificador,
    colonia,
    decanato,
    direccion,
    municipio,
    nombre,
    telefono1,
    telefono2,
  } = req.body;

  const nuevaParroquia = {
    identificador,
    nombre,
    colonia,
    direccion,
    municipio,
    telefono1,
    telefono2,
    decanato,
  };

  // --- validate decanato --- //
  // ---VVVVVVVVVVVVVVVVVV---- //
  const snapshot = await firestore.collection('decanatos').doc(decanato).get();
  if (!snapshot.exists) {
    return res.send({
      error: true,
      message: 'there is no decanato with that id',
    });
  }

  // Validate if a parroquia with identificador exists
  const parroquia = await firestore
    .collection('parroquias')
    .where('identificador', '==', nuevaParroquia.identificador)
    .get();

  if (!parroquia.empty) {
    return res.send({
      error: true,
      message: 'Ya existe una parroquia con el identificador proporcionado.',
    });
  }

  // --- Add new parroquia --- //
  // ----VVVVVVVVVVVVVVVV---- //
  const collrectionref = await firestore.collection('parroquias');
  try {
    const docref = await collrectionref.add(nuevaParroquia);
    nuevaParroquia.id = docref.id;
    res.send({
      error: false,
      data: nuevaParroquia,
    });
  } catch (err) {
    res.send({
      error: true,
      message: err.message,
    });
  }
};

/**
 * Removes a parish from the 'parroquias' collection
 */
const remove = async (firestore, req, res) => {
  //validate parroquia
  const snapshot = await firestore
    .collection('parroquias')
    .doc(req.params.id)
    .get();
  if (!snapshot.exists) {
    return res.send({
      error: true,
      message: 'no existe un parroquia con ese id',
    });
  }
  const capillas = snapshot.data().capillas; // lista de ids de capilla
  const capillas_borradas = [];
  if (capillas) {
    for (let capilla of capillas) {
      //validate capilla
      const snapshot = await firestore.collection('capillas').doc(capilla).get();
      if (snapshot.exists) {
        capillas_borradas.push({ id: snapshot.id, ...snapshot.data() });
        await firestore.collection('capillas').doc(capilla).delete();
      }
    }
  }
  await firestore.collection('parroquias').doc(req.params.id).delete();
  const parroquia = snapshot.data();
  parroquia.capillas_borradas = capillas_borradas;
  res.send({
    error: false,
    data: {
      id: req.params.id,
      ...parroquia,
    },
  });
};

/**
 * Changes data from a parish in the'parroquias' collection
 */
const update = async (firestore, req, res) => {
  console.log('update start');

  try {
    const payload = req.body;
    const id = payload.parroquia;
    const docref = firestore.collection('parroquias').doc(id);
    let snapshot = await docref.get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'No hay parroquia con ese id',
      });
    }

    if (snapshot.data().identificador !== payload.identificador) {
      // Validate if a parroquia with identificador exists
      const parroquia = await firestore
        .collection('parroquias')
        .where('identificador', '==', payload.identificador)
        .get();

      if (!parroquia.empty) {
        return res.send({
          error: true,
          message:
            'Ya existe una parroquia con el identificador proporcionado.',
        });
      }
    }

    await docref.set(
      {
        identificador: payload.identificador,
        nombre: payload.nombre,
        direccion: payload.direccion,
        colonia: payload.colonia,
        municipio: payload.municipio,
        telefono1: payload.telefono1,
        telefono2: payload.telefono2,
        decanato: payload.decanato,
      },
      { merge: true }
    );
    snapshot = await docref.get();
    res.send({
      error: false,
      data: snapshot.data(),
    });
  } catch (err) {
    res.send({
      error: true,
      message: err.message,
    });
  }
};

/**
 * Collects data from the 'parroquias collection to transfer to an .csv document.
 */
const dump = async (firestore, req, res) => {
  var parroquias = [];
  var headers = [
    'IDParroquia',
    'Nombre',
    'Dirección',
    'Colonia',
    'Municipio',
    'Telefono1',
    'Telefono2',
    'IDDecanato',
    'Decanato',
    'IDZona',
    'Zona',
  ];
  try {
    var parrSnap = await firestore.collection('parroquias').get();
    if (parrSnap.docs.length == 0) {
      var csv = toXLS(headers, []);
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.attachment('Parroquias.xls');
      return csv.pipe(res);
    }

    var decanatoId = [...new Set(parrSnap.docs.map((a) => a.data().decanato))];
    var decaSnap = await firestore.getAll(
      ...decanatoId.map((a) => firestore.doc('decanatos/' + a))
    );
    var decanatos = [];
    decaSnap.forEach((a) => {
      if (!a.exists) return;
      decanatos.push({
        id: a.id,
        ...a.data(),
      });
    });

    var zonasId = [...new Set(decanatos.map((a) => a.zona))];
    var zonaSnap = await firestore.getAll(
      ...zonasId.map((a) => firestore.doc('zonas/' + a))
    );
    var zonas = [];
    zonaSnap.forEach((a) => {
      if (!a.exists) return;
      zonas.push({
        id: a.id,
        ...a.data(),
      });
    });

    parrSnap.docs.forEach((a) => {
      if (!a.exists) return;
      var d = a.data();
      var dec = decanatos.find((a) => a.id == d.decanato);
      var z = dec ? zonas.find((a) => a.id == dec.zona) : null;
      parroquias.push([
        d.identificador || a.id,
        d.nombre,
        d.direccion,
        d.colonia,
        d.municipio,
        d.telefono1,
        d.telefono2,
        ...(!dec ? [] : [dec.id, dec.nombre]),
        ...(!z ? [] : [z.id, z.nombre]),
      ]);
    });

    var csv = Util.toXLS(headers, parroquias);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Parroquias.xls');
    return csv.pipe(res);
  } catch (e) {
    console.log(e);
    return res.redirect('back');
  }
};

const dumpForAcompanante = async (firestore, req, res) => {
  var headers = [
    'IDParroquia',
    'Nombre',
    'Dirección',
    'Colonia',
    'Municipio',
    'Telefono1',
    'Telefono2',
    'IDDecanato',
    'Decanato',
    'IDZona',
    'Zona',
  ];
  try {
    const acom = req.params.id;
    var decanatos = [];
    var parroquias = [];
    var decanRef, parroquiasRef;

    const zonaRef = await firestore
      .collection('zonas')
      .where('acompanante', '==', acom)
      .get();
    if (!zonaRef.empty) {
      const zonaId = zonaRef.docs[0].id;
      decanRef = await firestore
        .collection('decanatos')
        .where('zona', '==', zonaId)
        .get();
    } else {
      decanRef = await firestore
        .collection('decanatos')
        .where('acompanante', '==', acom)
        .get();
    }

    if (!decanRef.empty) {
      decanRef.docs.forEach((d) => {
        decanatos.push({
          id: d.id,
          nombre: d.data().nombre,
          zona: d.data().zona,
          nombreZona: d.data().nombreZona,
        });
      });
      for (dec of decanatos) {
        parroquiasRef = await firestore
          .collection('parroquias')
          .where('decanato', '==', dec.id)
          .get();
        if (!parroquiasRef.empty) {
          parroquiasRef.docs.forEach((p) => {
            d = p.data();
            parroquias.push([
              p.id,
              d.nombre,
              d.direccion,
              d.colonia,
              d.municipio,
              d.telefono1,
              d.telefono2,
              dec.id,
              dec.nombre,
              dec.zona,
              dec.nombreZona,
            ]);
          });
        }
      }
    } else {
      throw Error('Acompañante no asignado a Zona o Decanato');
    }

    var csv = Util.toXLS(headers, parroquias);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Parroquias.xls');
    return csv.pipe(res);
  } catch (e) {
    console.log(e);
    return res.redirect('back');
  }
};

module.exports = {
  getall: getall,
  getone: getone,
  add: add,
  remove: remove,
  udpate: update,
  dump: dump,
  dumpForAcompanante: dumpForAcompanante,
};
