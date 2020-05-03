//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const cors = require('cors')
const bodyParser = require('body-parser');
const parroquias = require('./routes/parroquia')
const decanato = require('./routes/decanato')
const login = require('./routes/login')
const capillas  = require('./routes/capillas')
const grupos = require('./routes/grupo')
const coordinadores = require('./routes/coordinadores')
const zonas = require('./routes/zonas')

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res)=>{res.send('Arquidiocesis Backend')})

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
app.all('*', login.verifyToken(firestore));


app.get('/api/parroquias', (req, res)=>{parroquias.getall(firestore, req, res)})
app.post('/api/parroquias', (req, res)=>{parroquias.add(firestore, req, res)})
app.get('/api/parroquias/:id', (req, res)=>{parroquias.getone(firestore, req, res)})

app.get('/api/decanatos', (req, res)=>{decanato.getall(firestore, req, res)})
app.get('/api/decanatos/:id', (req, res)=>{decanato.getone(firestore, req, res)})

app.post('/api/capillas', (req, res)=>{capillas.add(firestore, req, res)})

app.get('/api/grupos', (req, res)=>{grupos.getall(firestore, req, res)})
app.get('/api/grupos/:id', (req, res)=>{grupos.getone(firestore, req, res)})
app.post('/api/grupos', (req, res)=>{grupos.add(firestore, req, res)})
app.post('/api/grupos/register', (req, res)=>{grupos.addMember(firestore, req, res)})

app.get('/api/coordinadores', (req, res)=>coordinadores.getall(firestore, req, res));
app.get('/api/coordinadores/:id', (req, res)=>coordinadores.getone(firestore, req, res));
app.post('/api/coordinadores', (req, res)=>coordinadores.add(firestore, req, res));

app.get('/api/zonas', (req, res) => { zonas.getall(firestore, req, res) })
app.get('/api/zonas/:id', (req, res) => { zonas.getone(firestore, req, res) })
app.post('/api/zonas', (req, res) => {zonas.add(firestore, req, res) })


// No route found
app.all('*', (req, res)=>{
    return res.send({
        error: true,
        message: 'Mensaje inesperado.'
    });
})

app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)})