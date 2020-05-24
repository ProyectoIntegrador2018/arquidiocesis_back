const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');

const add = async(firestore, req, res)=>{
	var { name, age, email, password, gender } = req.body;
	if(!name || !age || !email || !password || !gender) return res.send({ error: true, message: 'Missing info.' });

	var checkEmail = await firestore.collection('logins').doc(email.toLowerCase()).get();
	if(checkEmail.exists) return res.send({ error: true, code: 1, message: 'Correo ya utilizado.' });

	var newCoordinador = {
		nombre: name,
		email: email.toLowerCase(),
		edad: age,
		coordinador: true,
		sexo: gender,
		coordinador: true,
	}

	var newLogin = {
		password: bcrypt.hashSync(password),
		tipo: 'coordinador',
		id: null
	}

	try{
		const docref = await firestore.collection('miembros').add(newCoordinador)
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
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}

}

const getall = async (firestore, req, res)=>{
	try{
		const snapshot = await (await firestore.collection('miembros').where('coordinador', '==', true)).get();
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

const editCoordinador = async (firestore, req, res) => {
	var id = req.params.id;
	var { 
		apellido_paterno,
		apellido_materno,
		domicilio,
		escolaridad,
		estado_civil,
		fecha_nacimiento,
		nombre,
		oficio,
		sexo
	} = req.body;

	var fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
	if(!fn.isValid()) fn = moment();

	try {
		var memberSnap = await firestore.collection('coordinadores').doc(id).get();
		if (!memberSnap.exists) return res.send({ error: true, message: 'Coordinador no existe.', code: 1 });
		await firestore.collection('coordinadores').doc(id).update({
			apellido_paterno,
			apellido_materno,
			domicilio,
			escolaridad,
			estado_civil,
			fecha_nacimiento: fn.toDate(),
			nombre,
			oficio,
			sexo
		});
		return res.send({
			error: false,
			data: true
		})
	} catch (err) {
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}
}

const remove = async (firestore, req, res)=>{
	var { id } = req.params;
	try{
		var coordSnap = await firestore.collection('coordinadores').doc(id).get('nombre');
		if(!coordSnap.exists) return res.send({
			error: true,
			message: 'El coordinador no existe'
		});
		var l = await firestore.collection('logins').where('id', '==', coordSnap.id).where('tipo', '==', 'coordinador').get();
		let batch = firestore.batch();
		l.docs.forEach(a=>{
			batch.delete(a.ref);
		})
		await batch.commit();
		await firestore.collection('coordinadores').doc(id).delete();

		return res.send({
			error: false,
			data: true
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Mensaje inesperado'
		})
	}
}

module.exports = {
	add,
	getall,
	getone,
	editCoordinador,
	remove
}