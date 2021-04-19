//init express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const cors = require('cors');
const bodyParser = require('body-parser');
const parroquias = require('./routes/parroquia');
const decanato = require('./routes/decanato');
const login = require('./routes/login');
const admins = require('./routes/admin');
const capillas = require('./routes/capillas');
const eventos = require('./routes/eventos');
const objetivos = require('./routes/objetivos');
const grupos = require('./routes/grupo');
const grupos_conv = require('./routes/grupo-conv');
const coordinadores = require('./routes/coordinadores');
const zonas = require('./routes/zonas');
const capacitacion = require('./routes/capacitacion');
const acompanante = require('./routes/acompanantes');
const participante = require('./routes/participante');
const estadisticas = require('./routes/estadisticas');
const roles = require('./routes/roles');
const channels = require('./routes/canal');
const publicacion = require('./routes/publicacion');
const all = require('./routes/all');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Arquidiocesis Backend');
});

//init firebase
const admin = require('firebase-admin');

// Check if environment variable for firebase
// auth is available
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  var serviceJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString();
  try {
    const serviceAccount = JSON.parse(serviceJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    throw e;
  }
} else {
  // Check if firebase auth file is present
  const serviceAccount = require('./ServiceAccountKey');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
app.get('/', (req, res) => {
  res.send('Arquidiocesis Backend').status(200);
});
app.post('/api/login', (req, res) => {
  login.authenticate(firestore, req, res);
});

// Check valid token
app.all('*', login.verifyToken(firestore));

app.post('/api/password/change', (req, res) => {
  login.changePassword(firestore, req, res);
});

app.all('/api/admin*', admins.isAdmin); // Check if user is an admin
app.get('/api/admin/users', (req, res) =>
  admins.getLogins(firestore, req, res)
);
app.post('/api/admin/users/get', (req, res) =>
  admins.getOne(firestore, req, res)
);
app.post('/api/admin/users/add', (req, res) =>
  admins.register(firestore, req, res)
);
app.post('/api/admin/users/password', (req, res) =>
  admins.changePassword(firestore, req, res)
);
app.post('/api/admin/users/delete', (req, res) =>
  admins.deleteAdmin(firestore, req, res)
);
app.post('/api/admin/users/edit', (req, res) =>
  admins.editUserDetail(firestore, req, res)
);

app.get('/api/parroquias', (req, res) => {
  parroquias.getall(firestore, req, res);
});
app.post('/api/parroquias', (req, res) => {
  parroquias.add(firestore, req, res);
});
app.get('/api/parroquias/:id', (req, res) => {
  parroquias.getone(firestore, req, res);
});
app.delete('/api/parroquias/:id', (req, res) =>
  parroquias.remove(firestore, req, res)
);
app.post('/api/parroquias/edit', (req, res) =>
  parroquias.udpate(firestore, req, res)
);
app.get('/api/parroquias/dump/:random', (req, res) => {
  parroquias.dump(firestore, req, res);
});
app.get('/api/parroquias/dumpAcompanante/:id', (req, res) => {
  parroquias.dumpForAcompanante(firestore, req, res);
});

app.get('/api/decanatos', (req, res) => {
  decanato.getall(firestore, req, res);
});
app.get('/api/decanatos/:id', (req, res) => {
  decanato.getone(firestore, req, res);
});
app.delete('/api/decanatos/:id/acompanante', (req, res) => {
  acompanante.removeDecanato(firestore, req, res);
});

app.post('/api/capillas', (req, res) => {
  capillas.add(firestore, req, res);
});
app.delete('/api/capillas/:id', (req, res) =>
  capillas.remove(firestore, req, res)
);
app.get('/api/capillas/:id', (req, res) =>
  capillas.getone(firestore, req, res)
);
app.post('/api/capillas/edit', (req, res) =>
  capillas.edit(firestore, req, res)
);
app.get('/api/capillas/dump/:random', (req, res) => {
  capillas.dump(firestore, req, res);
});
app.get('/api/capillas/dumpAcompanante/:id', (req, res) => {
  capillas.dumpForAcompanante(firestore, req, res);
});

app.get('/api/eventos', (req, res) => {
  eventos.getAll(firestore, req, res);
});
app.post('/api/eventos', (req, res) => {
  eventos.add(firestore, req, res);
});
app.delete('/api/eventos/:id', (req, res) => {
  eventos.remove(firestore, req, res);
});
app.post('/api/eventos/:id/edit', (req, res) =>
  eventos.edit(firestore, req, res)
);
app.get('/api/eventos/dump/:random', (req, res) => {
  eventos.dump(firestore, req, res);
});

app.get('/api/objetivos/:year', (req, res) => {
  objetivos.getAllByYear(firestore, req, res);
});
app.post('/api/objetivos', (req, res) => {
  objetivos.updateOne(firestore, req, res);
});

app.get('/api/grupos', (req, res) => {
  grupos.getall(firestore, req, res);
});
app.get('/api/grupos/acompanante/:id', (req, res) => {
  grupos.getForAcompanante(firestore, req, res);
});
app.get('/api/grupos/dump', (req, res) => {
  grupos.dump(firestore, req, res);
});
app.get('/api/grupos/:id', (req, res) => {
  grupos.getone(firestore, req, res);
});
app.get('/api/grupos/:id/bajas', (req, res) => {
  grupos.getBajasTemporales(firestore, req, res);
});
app.delete('/api/grupos/:id', (req, res) => {
  grupos.remove(firestore, req, res);
});
app.post('/api/grupos/:id/coordinador', (req, res) => {
  grupos.changeCoordinador(firestore, req, res);
});
app.get('/api/grupos/:id/asistencia/reporte/:random', (req, res) => {
  grupos.getAsistenciasReport(firestore, req, res);
});
app.get('/api/grupos/:id/asistencia/reportefechas/:random', (req, res) => {
  grupos.getAsistenciasAsistanceReport(firestore, req, res);
});
app.get('/api/grupos/:id/asistencia/:fecha', (req, res) => {
  grupos.getAsistencia(firestore, req, res);
});
app.post('/api/grupos/:id/asistencia/:fecha', (req, res) => {
  grupos.saveAsistencia(firestore, req, res);
});
app.post('/api/grupos/:id/asistencia', (req, res) => {
  grupos.registerAsistencia(firestore, req, res);
});
app.post('/api/grupos', (req, res) => {
  grupos.add(firestore, req, res);
});
app.post('/api/grupos/edit', (req, res) => grupos.edit(firestore, req, res));
app.post('/api/grupos/register', (req, res) => {
  grupos.addMember(firestore, req, res);
});
app.get('/api/grupos/miembro/:id', (req, res) => {
  grupos.getMember(firestore, req, res);
});
app.post('/api/grupos/miembro/:id/edit', (req, res) => {
  grupos.editMember(firestore, req, res);
});
app.post('/api/grupos/miembro/:id/edit/grupo', (req, res) => {
  grupos.editMemberGroup(firestore, req, res);
});
app.post('/api/grupos/miembro/:id/edit/status', (req, res) => {
  grupos.editMemberStatus(firestore, req, res);
});
app.post('/api/grupos/miembro/:id/edit/ficha', (req, res) => {
  grupos.editMemberFicha(firestore, req, res);
});

app.get('/api/coordinadores', (req, res) =>
  coordinadores.getall(firestore, req, res)
);
app.get('/api/coordinadores/:id', (req, res) =>
  coordinadores.getone(firestore, req, res)
);
app.get('/api/coordinadores/acompanante/:id', (req, res) =>
  coordinadores.getForAcompanante(firestore, req, res)
);
app.post('/api/coordinadores', (req, res) =>
  coordinadores.add(firestore, req, res)
);
app.post('/api/coordinadores/:id/edit', (req, res) =>
  coordinadores.editCoordinador(firestore, req, res)
);
app.delete('/api/coordinadores/:id', (req, res) =>
  coordinadores.remove(firestore, req, res)
);

app.get('/api/zonas', (req, res) => {
  zonas.getall(firestore, req, res);
});
app.get('/api/zonas/:id', (req, res) => {
  zonas.getone(firestore, req, res);
});
app.post('/api/zonas', (req, res) => {
  zonas.add(firestore, req, res);
});
app.delete('/api/zonas/:id/acompanante', (req, res) => {
  acompanante.removeZona(firestore, req, res);
});

app.post('/api/capacitacion/', (req, res) =>
  capacitacion.add(firestore, req, res)
);
app.get('/api/capacitacion/dump', (req, res) => {
  capacitacion.dump(firestore, req, res);
});
app.delete('/api/capacitacion/:id', (req, res) =>
  capacitacion.deleteOne(firestore, req, res)
);
app.post('/api/capacitacion/edit', (req, res) =>
  capacitacion.edit(firestore, req, res)
);
app.post('/api/capacitacion/edit/encargado', (req, res) =>
  capacitacion.changeCapacitador(firestore, req, res)
);
app.get('/api/capacitacion/:id/asistencia/reporte/:random', (req, res) => {
  capacitacion.getAsistenciasReport(firestore, req, res);
});
app.get(
  '/api/capacitacion/:id/asistencia/reportefechas/:random',
  (req, res) => {
    capacitacion.getAsistenciasAsistanceReport(firestore, req, res);
  }
);
app.get('/api/capacitacion/:id/asistencia/:fecha', (req, res) =>
  capacitacion.getAsistencia(firestore, req, res)
);
app.post('/api/capacitacion/:id/asistencia/:fecha', (req, res) =>
  capacitacion.saveAsistencia(firestore, req, res)
);
app.post('/api/capacitacion/:id/asistencia', (req, res) =>
  capacitacion.registerAsistencia(firestore, req, res)
);
app.get('/api/capacitacion/:id', (req, res) =>
  capacitacion.getone(firestore, req, res)
);
app.get('/api/capacitacion/:id/participantes', (req, res) =>
  capacitacion.getParticipantes(firestore, req, res)
);
app.get('/api/capacitacion/', (req, res) =>
  capacitacion.getall(firestore, req, res)
);
app.get('/api/capacitadores', (req, res) =>
  capacitacion.getCapacitadores(firestore, req, res)
);

app.get('/api/participante/:id', (req, res) =>
  participante.getone(firestore, req, res)
);
app.delete('/api/participante/:id', (req, res) =>
  participante.remove(firestore, req, res)
);
app.post('/api/participante/', (req, res) =>
  participante.add(firestore, req, res)
);
app.post('/api/participante/edit', (req, res) =>
  participante.edit(firestore, req, res)
);

app.get('/api/acompanantes', (req, res) =>
  acompanante.getAll(firestore, req, res)
);
app.get('/api/acompanantes/:id/place', (req, res) =>
  acompanante.getZonaOrDecanato(firestore, req, res)
);
app.post('/api/acompanante/zona', (req, res) =>
  acompanante.addZona(firestore, req, res)
);
app.post('/api/acompanante/decanato', (req, res) =>
  acompanante.addDecanato(firestore, req, res)
);
app.get('/api/acompanante/:id', (req, res) =>
  acompanante.getone(firestore, req, res)
);
app.post('/api/acompanante/edit', (req, res) =>
  acompanante.edit(firestore, req, res)
);

app.get('/api/reporte/acompanantes', (req, res) =>
  all.getAcompanantes(firestore, req, res)
);
app.get('/api/reporte/admins', (req, res) =>
  all.getAdmins(firestore, req, res)
);
app.get('/api/reporte/capacitaciones', (req, res) =>
  all.getCapacitaciones(firestore, req, res)
);
app.get('/api/reporte/capillas', (req, res) =>
  all.getCapillas(firestore, req, res)
);
app.get('/api/reporte/coordinadores', (req, res) =>
  all.getCoordinadores(firestore, req, res)
);
app.get('/api/reporte/coordinadoresAcompanante/:id', (req, res) =>
  all.getCoordinadoresForAcompanante(firestore, req, res)
);
app.get('/api/reporte/decanatos', (req, res) =>
  all.getDecanatos(firestore, req, res)
);
app.get('/api/reporte/decanatosAcompanante/:id', (req, res) =>
  all.decanatosForAcompanante(firestore, req, res)
);
app.get('/api/reporte/grupos', (req, res) =>
  all.getGrupos(firestore, req, res)
);
app.get('/api/reporte/logins', (req, res) =>
  all.getLogins(firestore, req, res)
);
app.get('/api/reporte/miembros', (req, res) =>
  all.getMiembros(firestore, req, res)
);
app.get('/api/reporte/parroquias', (req, res) =>
  all.getParroquias(firestore, req, res)
);
app.get('/api/reporte/participantes', (req, res) =>
  all.getParticipantes(firestore, req, res)
);
app.get('/api/reporte/zonas', (req, res) => all.getZonas(firestore, req, res));
app.get('/api/reporte/all', (req, res) => all.getall(firestore, req, res));

app.get('/api/estadisticas/', (req, res) =>
  estadisticas.getEstadisticas(firestore, req, res)
);

app.post('/api/groups', (req, res) => grupos_conv.add(firestore, req, res));
app.put('/api/groups/:id', (req, res) => grupos_conv.edit(firestore, req, res));
app.get('/api/groups/get', (req, res) => grupos_conv.getall(firestore, req, res));
app.put('/api/groups/removeUser/:id', (req, res) => grupos_conv.removeUser(firestore, req, res));
app.put('/api/groups/addUser/:id', (req, res) => grupos_conv.addUser(firestore, req, res));

app.post('/api/channels', (req, res) => channels.add(firestore, req, res));
app.put('/api/channels/:id', (req, res) => channels.add(firestore, req, res));

app.post('/api/posts', (req, res) => publicacion.add(firestore, req, res));
app.get('/api/posts/:id', (req, res) => publicacion.get(firestore, req, res));
app.put('/api/posts/edit/:id', (req, res) => publicacion.edit(firestore, req, res));
app.delete('/api/posts/delete/:id', (req, res) => publicacion.remove(firestore, req, res));
app.get('/api/posts/files/get/:id', (req, res) => publicacion.get_post_files(firestore, req, res));

app.post('/api/roles', (req, res) => roles.add(firestore, req, res));
app.get('/api/roles/all', (req, res) => roles.getAllRoles(firestore, req, res));
app.put('/api/roles/:id', (req, res) => roles.addRoleMember(firestore, req, res));
app.put('/api/roles/revoke:id', (req, res) => roles.revoke(firestore, req, res));
app.delete('/api/roles/:id', (req, res) => roles.remove(firestore, req, res));



// No route found
app.all('*', (req, res) => {
  return res.send({
    error: true,
    message: 'Mensaje inesperado.',
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
