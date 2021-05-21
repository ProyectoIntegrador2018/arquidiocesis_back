const admin = require('firebase-admin');

// Check if environment variable for firebase
// auth is available
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString();
  try {
    const serviceAccount = JSON.parse(serviceJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error(e);
  }
} else {
  // Check if firebase auth file is present
  const serviceAccount = require('../ServiceAccountKey');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

//Add information to current user
async function addInformationToUser(userEmail, data) {
  const usersRef = firestore.collection('users');
  const snapshot = await usersRef.where('email', '==', userEmail).get();

  snapshot.forEach(async (doc) => {
    console.log(doc.data());
    await usersRef.doc(doc.id).update(data);
  });
}

async function addInformationToUserWithId(userId, data) {
  const usersRef = firestore.collection('users');
  const logins = firestore.collection('logins');
  const snapshotMiddle = await logins.where('id', '==', userId).get();
  snapshotMiddle.docs.forEach(async (doc) => {
    const snapshot = await usersRef.where('email', '==', doc.id).get();
    snapshot.forEach(async (doc) => {
      await usersRef.doc(doc.id).update(data);
    });
  });
}

//Migrate logins to users
async function migrateLogins() {
  const loginsRef = firestore.collection('logins');
  const snapshot = await loginsRef.get();
  snapshot.forEach(async (doc) => {
    console.log(doc.id, '=>', doc.data());
    //start migration
    const usersRef = firestore.collection('users');
    await usersRef.add({
      email: doc.id,
      password: doc.data()['password'],
      // ID is not being used, unecessary field.
    });
  });
}

//Migrate acompanantes to users
async function migrateAcompanantes() {
  const acompanantesRef = firestore.collection('acompanantes');
  const snapshot = await acompanantesRef.get();
  snapshot.forEach(async (doc) => {
    const docEmail = doc.data()['email'];
    //start migration
    await addInformationToUser(docEmail, doc.data());
  });
}

//Migrate coordinadores to users
async function migrateCoordinadores() {
  const coordinadoresRef = firestore.collection('coordinadores');
  const snapshot = await coordinadoresRef.get();
  snapshot.forEach(async (doc) => {
    const docEmail = doc.data()['email'];
    //start migration
    await addInformationToUser(docEmail, doc.data());
  });
}

async function migrateAdmins() {
  const adminsRef = firestore.collection('admins');
  const snapshot = await adminsRef.get();
  snapshot.docs.forEach((doc) => {
    //start migration
    addInformationToUserWithId(doc.id, doc.data());
  });
}

async function migrateRoles() {
  let role_title = '';
  new_id = '';
  const role = firestore.collection('roles');
  const snap = await role.where('role_title', '==', role_title).get();
  await Promise.all(snap.docs.map(async (s) => role.doc(new_id).set(s.data())));
}

//execute this in case of any needed migration (backup suggested)
/*
    In order to execute this script run: yarn users-migrate or node users-migrate.
    Keep in mind this is executed in production database. it is highly suggested to have an updated backup for it.
    This file is intended to be executed when users collection gets compromised and needs to be restarted.
    This file is intended to be temporary, delete this file when it's not longer necessary.
*/
//migrateLogins();
//migrateAcompanantes();
//migrateCoordinadores();
//migrateAdmins();
