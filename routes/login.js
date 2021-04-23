/**
 * Module for managing Login
 * @module Login
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const SECRET = 'R?<=2vYPXm)n*_kd,Hp.W2GG[hD3b2D/';

/**
 * Authenticates the password and the email are matched
 */
const authenticate = async (firestore, req, res) => {
  const { password, email } = req.body;
  try {
    // get collection reference
    const collection = await firestore.collection('logins');
    // get document reference
    const user = await collection.doc(`${email.toLowerCase()}`);
    // validate document
    const snapshot = await user.get();
    if (snapshot.exists) {
      // since id is email, this validates email
      const data = snapshot.data(); //read the doc data
      const userData = await firestore
        .collection('users')
        .where('email', '==', `${email.toLowerCase()}`)
        .get();
      let data2 = null;
      if (userData.size > 0) {
        data2 = userData.docs[0].data();
      }
      delete data2.password;

      if (bcrypt.compareSync(password, data.password)) {
        //validate password
        const token = jwt.sign({ id: data.id }, SECRET);
        return res.send({
          error: false,
          data: {
            token,
            email: email.toLowerCase(),
            type: data.tipo,
            id: data.id,
          },
          userInfo: data2,
        });
      } else {
        return res.send({
          error: true,
          message: 'Contraseña equivocada',
        });
      }
    } else {
      return res.send({
        error: true,
        message: 'No se encontró el usuario.',
      });
    }
  } catch (err) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Verifies the token is sent is valid.
 */
const verifyToken = (firestore) => {
  return (req, res, next) => {
    let token;
    if (req.method === 'POST') {
      token = req.body.token;
    } else {
      token = req.query.token;
    }

    // No token sent.
    if (!token)
      return res.send({
        error: true,
        code: 900,
        message: 'Token invalid',
      });

    // Verify token
    verify(firestore, token).then((user) => {
      if (user) {
        req.user = user;
        // *** Falta ver donde van cada uno de los tipos nuevos ***
        req.user.admin =
          user.tipo === 'admin' ||
          user.tipo === 'superadmin' ||
          user.tipo === 'coordinador' ||
          user.tipo === 'acompañante_zona' ||
          user.tipo === 'acompañanate_decanato';
        req.user.readonly =
          user.tipo === 'coordinador' ||
          user.tipo === 'acompañante_zona' ||
          user.tipo === 'acompañanate_decanato';
        return next();
      } else
        return res.send({
          error: true,
          code: 900,
          message: 'Token invalid',
        });
    });
  };
};

/**
 * Auxiluary function to check the validity of a token.
 */
const verify = async (firestore, token) => {
  try {
    const decoded = jwt.verify(token, SECRET);
    const collection = await firestore.collection('logins');
    const query = await (await collection.where('id', '==', decoded.id)).get();
    if (query.empty) return false;
    const user = { ...query.docs[0].data(), email: query.docs[0].id };
    return user;
  } catch (err) {
    return false;
  }
};

/**
 * Changes the password of a user
 */
const changePassword = async (firestore, req, res) => {
  const { old_password, new_password } = req.body;
  if (new_password.length < 5)
    return res.send({
      error: true,
      message: 'La nueva contraseña debe de ser de minimo 5 caracteres.',
    });
  try {
    const userSnap = await firestore
      .collection('logins')
      .where('id', '==', req.user.id)
      .get();
    if (userSnap.size === 0)
      return res.send({
        error: true,
        message: 'No existe un usuario con ese id.',
      });
    const login = userSnap.docs[0].data();
    login.email = userSnap.docs[0].id;
    if (!bcrypt.compareSync(old_password, login.password)) {
      return res.send({
        error: true,
        code: 923, // Arbitrary number
        message: 'La contraseña actual es incorrecta.',
      });
    }
    const passwordHash = bcrypt.hashSync(new_password);
    await firestore
      .collection('logins')
      .doc(login.email)
      .update({ password: passwordHash });

    return res.send({
      error: false,
      message: 'Se ha cambiado la contraseña.',
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

module.exports = {
  authenticate,
  verifyToken,
  changePassword,
};
