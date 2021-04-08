/**
 * Module for managing database correction tasks
 * @module Correction
 */

//init firebase
const admin = require('firebase-admin');

// Check if environment variable for firebase
// auth is available
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  var serviceJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString();
  try {
    const serviceAccount = JSON.parse(serviceJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    throw e;
  }
} else {
  // Check if firebase auth file is present
  const serviceAccount = require('./ServiceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

async function addNombreZonaToDecanato() {
  firestore
    .collection('decanatos')
    .get()
    .then((dec_snap) => {
      dec_snap.docs.forEach(async (doc) => {
        const data = doc.data();
        const zona = await firestore.collection('zonas').doc(data.zona).get();
        const nombreZona = zona.data().nombre;
        await doc.ref.set({ nombreZona: nombreZona }, { merge: true });
      });
    });
}

module.exports = {
  addNombreZonaToDecanato,
};

require('make-runnable');
