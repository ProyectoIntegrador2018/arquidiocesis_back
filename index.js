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

const firestore = admin.firestore() 
app.get('/api/parroquias', (req, res)=>{})