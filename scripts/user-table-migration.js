const admin = require('firebase-admin')

// Check if environment variable for firebase
// auth is available
if(process.env.FIREBASE_SERVICE_ACCOUNT){
    var serviceJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString();
    try{
        const serviceAccount = JSON.parse(serviceJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
    }catch(e){
        throw e;
    }
}else{
    // Check if firebase auth file is present
    const serviceAccount = require('../ServiceAccountKey')
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

const firestore = admin.firestore()

//Add information to current user
async function addInformationToUser(userEmail, data){
    const usersRef = firestore.collection('users')
    const snapshot = await usersRef.where('email', '==', userEmail).get()

    snapshot.forEach(async doc => {
        console.log(doc.data())
        const additionResult = await usersRef.doc(doc.id).update(data)
        //console.log(additionResult)
      });
}

//Migrate logins to users
async function migrateLogins(){
const loginsRef = firestore.collection('logins')
const snapshot = await loginsRef.get()
snapshot.forEach(async doc => {
    console.log(doc.id, '=>', doc.data());
    //start migration
    const usersRef = firestore.collection('users')
    const docRef = await usersRef.add({
        "email": doc.id,
        "password": doc.data()['password']
        // no se utiliza ID, se considera innecesario
    })

    console.log(docRef);
  });
}

//Migrate acompanantes to users
async function migrateAcompanantes(){
    const acompanantesRef = firestore.collection('acompanantes')
    const snapshot = await acompanantesRef.get()
    snapshot.forEach(async doc => {
        //console.log(doc.id, '=>', doc.data());
        const docEmail = doc.data()['email']
        //start migration
        await addInformationToUser(docEmail, doc.data())
      });
    }

//execute
//migrateLogins()
migrateAcompanantes()
