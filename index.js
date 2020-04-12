//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const cors = require('cors')
const parroquias = require('./routes/parroquia')
app.use(cors())
app.use(express.json())
app.get('/', (req, res)=>{'Arquidiocesis Backend'})

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const firestore = admin.firestore() 
app.get('/api/parroquias', (req, res)=>{parroquias.getall(firestore, req, res)})
app.post('/api/parroquias', (req, res)=>{parroquias.add(firestore, req, res)})