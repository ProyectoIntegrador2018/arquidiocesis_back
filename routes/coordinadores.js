const bcrypt = require('bcrypt-nodejs');

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
	var { coordinador } = req.body;
	try {
		var memberSnap = await firestore.collection('miembros').doc(id).get('nombre');
		if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
		var edited_member = {
			coordinador: coordinador,
		}
		await firestore.collection('miembros').doc(id).update(edited_member);
		return res.send({
			error: false,
			data: edited_member
		})
	} catch (err) {
		console.log(err);
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}
}

module.exports = {
	add,
	getall,
	getone,
	editCoordinador
}