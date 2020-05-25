const moment = require('moment');
const firebase = require('firebase-admin')

const add = async (firestore, req, res)=>{
    const payload = req.body
	let nombre, encargado, inicio, fin
	
	if(!req.user.admin && !req.user.tipo.startsWith('acompañante')){
		return res.send({
			error: true,
			code: 999,
			message: 'No tienes acceso a esta acción'
		})
	}
	
    try{
        nombre = payload.nombre
        encargado = payload.encargado
        inicio = firebase.firestore.Timestamp.fromDate(moment(payload.inicio, 'YYYY-MM-DD').toDate())
        fin = firebase.firestore.Timestamp.fromDate(moment(payload.fin, 'YYYY-MM-DD').toDate())
    }catch(err){
        return res.send({
            error: true, 
            message: 'error al parsear el payload\n' + err
        })
    }

    //validar que exista en coordinador 
    let snapshot = await firestore.collection('coordinadores').doc(encargado).get()
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'No hay capacitador con eses id'
        })
    }

    try{
        const writeresult = await firestore.collection('capacitaciones').add({
            nombre,
            encargado, 
            inicio,
            fin 
        })
        res.send({
            error: false, 
            data: writeresult.updateTime
        })
    }catch(err){
        return res.send({
            error: true, 
            message: 'error al escribir los datos a db\n' + err
        })
    }
}

/* copy pasted code, cambio de var a const y grupos a capacitaciones */
const getAsistencia = async (firestore, req, res)=>{
	const {id, fecha} = req.params;
	try{
		const assist = await firestore.collection('capacitaciones/'+id+'/asistencias').doc(fecha).get();
		if(!assist.exists){
			return res.send({
				error: true,
				code: 34, // Arbitrary number
				message: 'No such assistance'
			});
		}
		const groupSnap = await firestore.collection('capacitaciones').doc(id).get();
		if(!groupSnap.exists) return res.send({ error: true, message: 'capacitacion no existe.', code: 1 });

		const asistentes = assist.get('miembros');
		const miembros = []
		const asistSnap = await firestore.getAll(...asistentes.map(a=>firestore.doc('participantes/'+a)));
		asistSnap.forEach(a=>{
			if(a.exists) miembros.push({ id: a.id, nombre: a.data().nombre, assist: assist.get('miembros').findIndex(b=>b==a.id)!=-1 })
		});

		const miembrosSnap = await firestore.collection('participantes').where('capacitacion', '==', groupSnap.id).get()
		miembrosSnap.forEach(a=>{
			if(!a.exists) return;
			if(asistentes.findIndex(b=>b==a.id)!=-1) return;
			miembros.push({ id: a.id, nombre: a.data().nombre, assist: false });
		})

		return res.send({
			error: false,
			data: { miembros } 
		})

	}catch(err){
		console.error(err);
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}
}

const registerAsistencia = async (firestore, req, res)=>{
	const id = req.params.id;
	const { fecha, miembros, force } = req.body;

	const date = moment(fecha, 'YYYY-MM-DD');
	if(!date.isValid()){
		return res.send({ error: true, message: 'Invalid date'})
	}

	const capacitacion = await firestore.collection('capacitaciones').doc(id).get();
	if(!capacitacion.exists){
		return res.send({
			error: true,
			message: 'capacitacion doesnt exist'
		})
	}

	if(!force){
		const oldAssistance = await firestore.collection('capacitaciones/'+id+'/asistencias').doc(fecha).get();
		if(oldAssistance.exists){
			return res.send({ 
				error: true,
				code: 52, // Arbitrary number
				message: 'Assistance of that date already exists.'
			})
		}
	}

	try{
		await firestore.collection('capacitaciones/'+id+'/asistencias').doc(date.format('YYYY-MM-DD')).set({ miembros });
		return res.send({
			error: false,
			data: date.format('YYYY-MM-DD')
		});
	}catch(err){
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}
}

const saveAsistencia = async (firestore, req, res)=>{
	const {id, fecha} = req.params;
	const { miembros } = req.body;

	const date = moment(fecha, 'YYYY-MM-DD');
	if(!date.isValid()){
		return res.send({ error: true, message: 'Invalid date'})
	}

	try{
		if(!miembros || miembros.length==0){
			await firestore.collection('capacitaciones/'+id+'/asistencias').doc(date.format('YYYY-MM-DD')).delete();
			return res.send({
				error: false,
				data: { deleted: true, date: date.format('YYYY-MM-DD') }
			})
		}else{
			await firestore.collection('capacitaciones/'+id+'/asistencias').doc(date.format('YYYY-MM-DD')).set({ miembros });
			return res.send({
				error: false,
				data: { deleted: false, date: date.format('YYYY-MM-DD') }
			})
		}
	}catch(e){
		console.error(e);
		return res.send({
			error: true,
			message: 'Unexpected error.'
		})
	}
}

const getone = async (firestore, req, res)=>{
	const id = req.params.id
	const snapshot = await firestore.collection('capacitaciones').doc(id).get()
	if(!snapshot.exists){

		return res.send({
			error: true, 
			message: 'no existe capacitacion con ese id'
		})
	}
	res.send({
		error: false, 
		data: snapshot.data()
	})
}

const getall = async (firestore, req, res)=>{
	const snapshot = await firestore.collection('capacitaciones').get()
	const docs = snapshot.docs.map(doc =>{
		return {
			id: doc.id,
			...doc.data()
		}
	})
	res.send({
		error:false, 
		data: docs
	})
}

module.exports = {
    add: add,
    getAsistencia,
    registerAsistencia,
	saveAsistencia,
	getone: getone, 
	getall: getall
}