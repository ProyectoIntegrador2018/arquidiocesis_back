const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
const express = require('express')
const app = express()
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()
getQuote().then(result=>{
    console.log()
})

const PORT = process.env.PORT | 8000

app.get('/', (req, res)=>{'Arquidiocesis Backend'})

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})