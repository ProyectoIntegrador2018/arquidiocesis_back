const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');

const add = async(firestore, req, res)=>{
	var {
		nombre,
		apellido_paterno,
		apellido_materno,
		estado_civil,
		sexo,
		email,
		fecha_nacimiento,
		escolaridad,
		oficio,
		domicilio,
		password
	} = req.body;

	var checkEmail = await firestore.collection('logins').doc(email.toLowerCase()).get();
	if(checkEmail.exists) return res.send({ error: true, code: 1, message: 'Correo ya utilizado.' });

	var fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
	if(!fn.isValid()) fn = moment();

	var newCoordinador = {
		nombre,
		apellido_paterno,
		apellido_materno,
		fecha_nacimiento: fn,
		sexo,
		estado_civil,
		email,
		escolaridad,
		oficio,
		domicilio,
		estatus: 0, // 0 = Activo, 1 = Baja Temporal, 2 = Baja definitiva
		coordinador: false
  	}

	var newLogin = {
		password: bcrypt.hashSync(password),
		tipo: 'coordinador',
		id: null
	}

	try{
		const docref = await firestore.collection('coordinadores').add(newCoordinador)
		newLogin.id = docref.id
		const login = await firestore.collection('logins').doc(email.toLowerCase()).set(newLogin);

		return res.send({
			error: false,
			data: {
				id: docref.id,
				...newCoordinador
			}
		})
	}catch(e){
		console.log(e);
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}

}

const getall = async (firestore, req, res)=>{
	try{
		const snapshot = await firestore.collection('coordinadores').get();
		var coordinadores = []
		snapshot.forEach(doc => {
			coordinadores.push({ id: doc.id, ...doc.data() });
		});
		return res.send({
			error: false,
			data: coordinadores
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}
}

const getone = async (firestore, req, res)=>{
	
}

module.exports = {
	add,
	getall,
	getone
}