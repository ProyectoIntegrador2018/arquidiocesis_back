//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const cors = require('cors')
const bodyParser = require('body-parser');
const capacitadores = require('./routes/capacitadores')

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

app.get('/api/capacitadores', (req, res) => { capacitadores.getall(firestore, req, res) })
app.post('/api/capacitadores', (req, res) => { capacitadores.add(firestore, req, res) })

