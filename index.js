//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000

app.get('/', (req, res)=>{'Arquidiocesis Backend'})

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()

// TEST WRITE
// let aTuringRef = db.collection('users').doc('aturing');

// let setAlan = aTuringRef.set({
//   'first': 'Alan',
//   'middle': 'Mathison',
//   'last': 'Turing',
//   'born': 1912
// });

// TEST READ
// db.collection('users').get()
//     .then((snapshot)=>{
//         snapshot.forEach((doc)=>{
//             console.log(doc.id, '=>', doc.data())
//         })
//     })
//     .catch((err)=>{
//         console.log('Error getting documents', err)
//     })
