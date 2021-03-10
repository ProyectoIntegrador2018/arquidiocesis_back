/**
 * Module for managing 'Admins'
 * @module Admin
 */
const bcrypt = require('bcrypt-nodejs');

/**
 * /
 * Verifies that the account is an Administrador
 */
const isAdmin = (req, res, next, redirect = false) => {
  if (req.user.tipo == 'admin' || req.user.tipo == 'superadmin') return next();
  else {
    if (redirect) {
      return res.redirect('back');
    } else {
      return res.send({
        error: true,
        message: 'Usuario no es administrador.',
      });
    }
  }
};

/**
 * /
 * Gets all logins that are of type admin */
const getLogins = async (firestore, req, res) => {
  const loginSnap = await firestore
    .collection('logins')
    .where('tipo', 'in', [
      'admin',
      'integrante_chm',
      'coordinador',
      'acompañante_zona',
      'acompañante_decanato',
      'capacitacion',
    ])
    .get();
  var logins = loginSnap.docs.map((a) => ({
    email: a.id,
    member_id: a.data().id,
    tipo: a.data().tipo,
  }));
  return res.send({
    error: false,
    data: logins,
  });
};

/**
 * /
 * Gets a specific user
 */
const getOne = async (firestore, req, res) => {
  var { id, email, type } = req.body;

  try {
    var loginSnap = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (!loginSnap.exists)
      return res.send({
        error: true,
        message: 'Usuario no existe',
      });
    var login = loginSnap.data();
    var member;
    var memberSnap;

    switch (type) {
    case 'admin':
    case 'integrante_chm':
    case 'capacitacion':
      memberSnap = await firestore.collection('admins').doc(id).get();
      break;
    case 'acompañante_zona':
    case 'acompañante_decanato':
      memberSnap = await firestore.collection('acompanantes').doc(id).get();
      break;
    case 'coordinador':
      memberSnap = await firestore.collection('coordinadores').doc(id).get();
      break;
    default:
      throw Error('Tipo de usuario no valido');
    }

    if (!memberSnap.exists) {
      member = {
        email: loginSnap.id,
        tipo: login.tipo,
      };
    } else {
      member = memberSnap.data()
      ;(member.email = loginSnap.id), (member.tipo = login.tipo);
    }
  } catch (e) {
    console.log(e.message);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }

  return res.send({
    error: false,
    data: member,
  });
};

/**
 * /
 * Change the password for the admin.
 */
const changePassword = async (firestore, req, res) => {
  var { email, password } = req.body;
  try {
    var loginSnap = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (!loginSnap.exists)
      return res.send({
        error: true,
        message: 'Usuario no existe',
      });
    var passwordHash = bcrypt.hashSync(password);
    await firestore
      .collection('logins')
      .doc(loginSnap.id)
      .update({ password: passwordHash });
    return res.send({
      error: false,
      data: {
        emai: email.toLowerCase(),
      },
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Registers a new admin
 */
const register = async (firestore, req, res) => {
  var {
    nombre,
    apellido_paterno,
    apellido_materno,
    sexo,
    tipo,
    email,
    password,
  } = req.body;

  if (
    [
      'admin',
      'coordinador',
      'integrante_chm',
      'acompañante_zona',
      'acompañante_decanato',
      'capacitacion',
    ].indexOf(tipo) == -1
  ) {
    return res.send({
      error: true,
      message: 'Tipo de usuario invalido',
    });
  }
  if (['Masculino', 'Femenino', 'Sin especificar'].indexOf(sexo) == -1) {
    return res.send({
      error: true,
      message: 'Sexo invalido.',
    });
  }
  if (password.length < 5)
    return res.send({ error: true, message: 'Contraseña invalida.' });
  var miembro = { nombre, apellido_paterno, sexo };
  if (apellido_materno) {
    miembro.apellido_materno = apellido_materno;
  }

  try {
    var prev_login = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (prev_login.exists) {
      return res.send({
        error: true,
        code: 623,
        message: 'Usuario con ese correo ya existe.',
      });
    }

    const new_admin = await firestore.collection('admins').add(miembro);
    var login = {
      id: new_admin.id,
      password: bcrypt.hashSync(password),
      tipo,
    };
    await firestore
      .collection('logins')
      .doc(email.toLowerCase().trim())
      .set(login);
    return res.send({
      error: false,
      data: {
        email: email.toLowerCase(),
        id: new_admin.id,
        tipo,
      },
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Deletes an specific admin
 */
const deleteAdmin = async (firestore, req, res) => {
  var { email } = req.body;
  if (req.user.email.toLowerCase() == email.toLowerCase()) {
    return res.send({
      error: true,
      code: 682,
      message: 'No se puede eliminar a uno mismo.',
    });
  }

  try {
    var loginSnap = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (!loginSnap.exists)
      return res.send({
        error: true,
        message: 'Usuario no existe',
      });

    await firestore.collection('admins').doc(loginSnap.data().id).delete();
    await firestore.collection('logins').doc(loginSnap.id).delete();
  } catch (e) {
    return res.send({
      error: true,
      message: 'Mensaje inesperado.',
    });
  }

  return res.send({
    error: false,
    data: true,
  });
};

/**
 * /
 * Edits data from a specific user
 */
const editUserDetail = async (firestore, req, res) => {
  var {
    id,
    email,
    nombre,
    apellido_paterno,
    apellido_materno,
    sexo,
    tipo,
  } = req.body;

  if (
    [
      'admin',
      'integrante_chm',
      'coordinador',
      'acompañante_zona',
      'acompañante_decanato',
      'capacitacion',
    ].indexOf(tipo) == -1
  ) {
    return res.send({
      error: true,
      message: 'Tipo de usuario invalido',
    });
  }
  if (['Masculino', 'Femenino', 'Sin especificar'].indexOf(sexo) == -1) {
    return res.send({
      error: true,
      message: 'Sexo invalido.',
    });
  }
  var miembro = { nombre, apellido_paterno, sexo };
  if (apellido_materno) {
    miembro.apellido_materno = apellido_materno;
  }

  try {
    var loginSnap = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (!loginSnap.exists)
      return res.send({
        error: true,
        message: 'Usuario no existe',
      });

    var collection;

    switch (tipo) {
    case 'admin':
    case 'integrante_chm':
    case 'capacitacion':
      collection = 'admins';
      break;
    case 'acompañante_zona':
    case 'acompañante_decanato':
      collection = 'acompanantes';
      break;
    case 'coordinador':
      collection = 'coordinadores';
      break;
    default:
      throw Error('Tipo de usuario no valido');
    }

    await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .update({ tipo });
    await firestore.collection(collection).doc(id).update(miembro);
    miembro.tipo = tipo;
    miembro.email = email.toLowerCase();
    return res.send({
      error: false,
      data: miembro,
    });
  } catch (e) {
    console.log(e.message);
    return res.send({
      error: false,
      message: 'Error inesperado.',
    });
  }
};

module.exports = {
  isAdmin,
  getLogins,
  getOne,
  register,
  deleteAdmin,
  changePassword,
  editUserDetail,
};
