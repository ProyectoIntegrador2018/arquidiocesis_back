//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const login = require('./routes/login')
const cors = require('cors')
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const firestore = admin.firestore()

app.get('/', (req, res)=>{res.send('Arquidiocesis Backend').status(200)})
app.post('/api/login', (req, res) => { login.authenticate(firestore, req, res) })

// Check valid token
app.all('*', login.verifyToken(firestore))

// =======================
// Logged in section below
// ========VVVVVVV========





// No route found
app.all('*', (req, res)=>{
    return res.send({
        error: true,
        message: 'Mensaje inesperado.'
    });
})
app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})
