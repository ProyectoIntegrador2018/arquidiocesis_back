//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const login = require('./routes/login')
const cors = require('cors')
app.use(cors())
app.use(express.json())

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const firestore = admin.firestore()

app.get('/', (req, res)=>{res.send('Arquidiocesis Backend').status(200)})
app.post('/api/login', (req, res) => { login.authenticate(firestore, req, res) })

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})
