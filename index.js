//init express
const express = require('express')
const app = express()
const PORT = process.env.PORT | 8000
const cors = require('cors')
const bodyParser = require('body-parser');
const parroquias = require('./routes/parroquia')
const decanato = require('./routes/decanato')
const login = require('./routes/login')
const admins = require('./routes/admin')
const capillas  = require('./routes/capillas')
const grupos = require('./routes/grupo')
const coordinadores = require('./routes/coordinadores')
const zonas = require('./routes/zonas')
const capacitacion = require('./routes/capacitacion')
const acompanante = require('./routes/acompanantes')
const participante = require('./routes/participante')

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.send('Arquidiocesis Backend') })

//init firebase
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const firestore = admin.firestore()
app.get('/', (req, res) => { res.send('Arquidiocesis Backend').status(200) })
app.post('/api/login', (req, res) => { login.authenticate(firestore, req, res) })

// Check valid token
app.all('*', login.verifyToken(firestore));

app.post('/api/password/change', (req, res) => { login.changePassword(firestore, req, res) })

app.all('/api/admin*', admins.isAdmin); // Check if user is an admin
app.get('/api/admin/users', (req, res)=>admins.getLogins(firestore, req, res));
app.post('/api/admin/users/get', (req, res)=>admins.getOne(firestore, req, res));
app.post('/api/admin/users/add', (req, res)=>admins.register(firestore, req, res));
app.post('/api/admin/users/password', (req, res)=>admins.changePassword(firestore, req, res));
app.post('/api/admin/users/delete', (req, res)=>admins.deleteAdmin(firestore, req, res));
app.post('/api/admin/users/edit', (req, res)=>admins.editAdmin(firestore, req, res));

app.get('/api/parroquias', (req, res)=>{parroquias.getall(firestore, req, res)})
app.post('/api/parroquias', (req, res)=>{parroquias.add(firestore, req, res)})
app.get('/api/parroquias/:id', (req, res)=>{parroquias.getone(firestore, req, res)})
app.delete('/api/parroquias/:id', (req, res)=>parroquias.remove(firestore, req, res))
app.post('/api/parroquias/edit', (req, res)=>parroquias.udpate(firestore, req, res))

app.get('/api/decanatos', (req, res)=>{decanato.getall(firestore, req, res)})
app.get('/api/decanatos/:id', (req, res)=>{decanato.getone(firestore, req, res)})
app.delete('/api/decanatos/:id/acompanante', (req, res)=>{ acompanante.removeDecanato(firestore, req, res) })

app.post('/api/capillas', (req, res) => { capillas.add(firestore, req, res) })
app.delete('/api/capillas/:id', (req, res) => capillas.remove(firestore, req, res))
app.get('/api/capillas/:id', (req, res) => capillas.getone(firestore, req, res))

app.get('/api/grupos', (req, res)=>{grupos.getall(firestore, req, res)})
app.get('/api/grupos/:id', (req, res)=>{grupos.getone(firestore, req, res)})
app.get('/api/grupos/:id/bajas', (req, res)=>{grupos.getBajasTemporales(firestore, req, res)})
app.delete('/api/grupos/:id', (req, res)=>{grupos.remove(firestore, req, res)})
app.post('/api/grupos/:id/coordinador', (req, res)=>{grupos.changeCoordinador(firestore, req, res)})
app.get('/api/grupos/:id/asistencia/:fecha', (req, res)=>{grupos.getAsistencia(firestore, req, res)})
app.post('/api/grupos/:id/asistencia/:fecha', (req, res)=>{grupos.saveAsistencia(firestore, req, res)})
app.post('/api/grupos/:id/asistencia', (req, res)=>{grupos.registerAsistencia(firestore, req, res)})
app.post('/api/grupos', (req, res)=>{grupos.add(firestore, req, res)})
app.post('/api/grupos/edit', (req, res)=>grupos.edit(firestore, req, res));
app.post('/api/grupos/register', (req, res) => { grupos.addMember(firestore, req, res) });
app.get('/api/grupos/miembro/:id', (req, res) => { grupos.getMember(firestore, req, res) });
app.post('/api/grupos/miembro/:id/edit', (req, res) => { grupos.editMember(firestore, req, res) })
app.post('/api/grupos/miembro/:id/edit/grupo', (req, res) => { grupos.editMemberGroup(firestore, req, res) })
app.post('/api/grupos/miembro/:id/edit/status', (req, res) => { grupos.editMemberStatus(firestore, req, res) })
app.post('/api/grupos/miembro/:id/edit/ficha', (req, res) => { grupos.editMemberFicha(firestore, req, res) })

app.get('/api/coordinadores', (req, res)=>coordinadores.getall(firestore, req, res));
app.get('/api/coordinadores/:id', (req, res)=>coordinadores.getone(firestore, req, res));
app.post('/api/coordinadores', (req, res) => coordinadores.add(firestore, req, res));
app.post('/api/coordinadores/:id/edit', (req, res) => coordinadores.editCoordinador(firestore, req, res));
app.delete('/api/coordinadores/:id', (req, res) => coordinadores.remove(firestore, req, res));

app.get('/api/zonas', (req, res) => { zonas.getall(firestore, req, res) })
app.get('/api/zonas/:id', (req, res) => { zonas.getone(firestore, req, res) })
app.post('/api/zonas', (req, res) => {zonas.add(firestore, req, res) })
app.delete('/api/zonas/:id/acompanante', (req, res)=>{ acompanante.removeZona(firestore, req, res) })

app.post('/api/capacitacion/', (req, res)=>capacitacion.add(firestore, req, res))
app.get('/api/capacitacion/:id/asistencia/:fecha', (req, res)=>capacitacion.getAsistencia(firestore, req, res))
app.post('/api/capacitacion/:id/asistencia/:fecha', (req, res)=>capacitacion.saveAsistencia(firestore, req, res))
app.post('/api/capacitacion/:id/asistencia', (req, res)=>capacitacion.registerAsistencia(firestore, req, res))

app.post('/api/participante/', (req, res)=>participante.add(firestore, req, res))

app.post('/api/acompanante/zona', (req, res)=>acompanante.addZona(firestore, req, res));
app.post('/api/acompanante/decanato', (req, res)=>acompanante.addDecanato(firestore, req, res));
app.get('/api/acompanante/:id', (req, res)=>acompanante.getone(firestore, req, res));
app.post('/api/acompanante/edit', (req, res)=>acompanante.edit(firestore, req, res));

// No route found
app.all('*', (req, res) => {
    return res.send({
        error: true,
        message: 'Mensaje inesperado.'
    });
})

app.listen(PORT, () => { console.log(`Listening on port: ${PORT}...`) })