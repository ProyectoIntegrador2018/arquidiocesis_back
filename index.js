//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const cors = require('cors')
const bodyParser = require('body-parser');
const zonas = require('./routes/zonas')

app.use(cors())
app.use(express.json())
app.get('/', (req, res)=>{'Arquidiocesis Backend'})

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const firestore = admin.firestore() 


app.get('/api/zonas', (req, res) => { zonas.getall(firestore, req, res) })
app.get('/api/zonas/:id', (req, res) => { zonas.getone(firestore, req, res) })
app.post('/api/zonas', (req, res) => {zonas.add(firestore, req, res) })

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})