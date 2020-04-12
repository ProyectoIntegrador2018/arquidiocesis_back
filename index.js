//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const decanato = require('./routes/decanato')

app.get('/', (req, res)=>{'Arquidiocesis Backend'})

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const firestore = admin.firestore()
app.get('/api/decanatos', (req, res)=>{decanato.getall(firestore, req, res)})
app.get('/api/decanatos/:id', (req, res)=>{decanato.getone(firestore, req, res)})
