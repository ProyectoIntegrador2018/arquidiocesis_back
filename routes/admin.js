const bcrypt = require('bcrypt-nodejs');

const isAdmin = (req, res, next)=>{
	if(req.user.tipo=='admin') return next();
	else return res.send({
		error: true,
		message: 'Usuario no es administrador.'
	})
}

const getLogins = async (firestore, req, res)=>{
	const loginSnap = await firestore.collection('logins').where('tipo', 'in', ['admin', 'coordinador_general', 'acompañante_operativo']).get();
	var logins = loginSnap.docs.map(a=>({ email: a.id, member_id: a.data().id, tipo: a.data().tipo }));
	return res.send({
		error: false,
		data: logins,
	})
}

const getOne = async (firestore, req, res)=>{
	var { email } = req.body;
	try{
		var loginSnap = await firestore.collection('logins').doc(email.toLowerCase()).get();
		if(!loginSnap.exists) return res.send({
			error: true,
			message: 'Usuario no existe',
		})
		var login = loginSnap.data();
		var member;
		var memberSnap = await firestore.collection('miembros').doc(login.id).get();
		if(!memberSnap.exists){
			member = {
				email: loginSnap.id,
				tipo: login.tipo	
			}
		}else{
			member = memberSnap.data();
			member.email = loginSnap.id,
			member.tipo = login.tipo
		}
	}catch(e){
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}

	return res.send({
		error: false,
		data: member
	})
}

const changePassword = async (firestore, req, res)=>{
	var { email, password } = req.body;
	try{
		var loginSnap = await firestore.collection('logins').doc(email.toLowerCase()).get();
		if(!loginSnap.exists) return res.send({
			error: true,
			message: 'Usuario no existe',
		});
		var passwordHash = bcrypt.hashSync(password);
		await firestore.collection('logins').doc(loginSnap.id).update({ password: passwordHash });
		return res.send({
			error: false,
			message: 'Se ha cambiado la contraseña'
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Error inesperado'
		})
	}
}

const register = async (firestore, req, res)=>{
	var {
		nombre,
		apellido_paterno,
		apellido_materno,
		sexo,
		tipo,
		email,
		password
	} = req.body;

	if(['admin', 'coordinador_general', 'acompañante_operativo'].indexOf(tipo)==-1){
		return res.send({
			error: true,
			message: 'Tipo de usuario invalido'
		});
	}
	if([ 'Masculino', 'Femenino', 'Sin especificar' ].indexOf(sexo)==-1){
		return res.send({
			error: true,
			message: 'Sexo invalido.'
		});
	}
	if(password.length<5) return res.send({ error: true, message: 'Contraseña invalida.' });
	var miembro = { nombre, apellido_paterno, sexo };
	if(apellido_materno){
		miembro.apellido_materno = apellido_materno;
	}
	
	try{
		var prev_login = await firestore.collection('logins').doc(email.toLowerCase()).get()
		if(prev_login.exists){
			return res.send({
				error: true,
				code: 623,
				message: 'Usuario con ese correo ya existe.'
			})
		}


		const new_miembro = await firestore.collection('miembros').add(miembro);
		var login = { 
			id: new_miembro.id,
			password: bcrypt.hashSync(password), 
			tipo
		};
		const new_login = await firestore.collection('logins').doc(email.toLowerCase()).set(login);
		return res.send({
			error: false,
			data: {
				email: email.toLowerCase(),
				id: new_miembro.id,
				tipo
			}
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Error inesperado'
		})
	}
}

module.exports = {
	isAdmin,
	getLogins,
	getOne,
	register,
	changePassword
}