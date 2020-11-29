/** 
 * Module for managing 'capacitaciones' 
 * @module Capacitacion
 */
const moment = require('moment');
const firebase = require('firebase-admin')
/** @alias module:Util */
const Util = require('./util');

/**
 * Adds a new document to the 'Capacitation' collection 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {POST} req 
 * @param {JSON} req.user - contains information regarding the currently signed in user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'coordinador'
 * @param {String} req.user.admin - If user is admin or not 
 * @param {JSON} req.body
 * @param {JSON} req.body.payload
 * @param {String} req.body.payload.nombre 
 * @param {String} req.body.payload.encargado
 * @param {String} req.body.payload.inicio - Beginning date of course YYYY-MM-DD
 * @param {String} req.body.payload.fin - End date of course YYYY-MM-DD
 * 
 * @param {JSON} res 
 * @param {Boolean} res.error - True if there was an error else false
 * @param {Number} [res.code] - if error, code = 999 if user is not authorized for that operation 
 * @param {String} [res.message] - Assigned if error = true, contains the error message
 * @param {Number} [res.data] - Assigned if error = false, contains the write time of the operation 
 */
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
		let snapshot = await firestore.collection('logins').where('tipo', '==', 'capacitacion')
			.where('id', '==', encargado).get();

    if (snapshot.empty){
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
			fin,
			fecha_creada: new Date()
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
/**
 * Updates the coordinator incharge of a course
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {POST} req 
 * @param {JSON} req.user - contains information regarding the currently signed in user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'coordinador'
 * @param {String} req.user.admin - If user is admin or not 
 * @param {JSON} req.body
 * @param {String} req.body.id - The id of the course to change
 * @param {String} req.body.coordinador - The id of the new coordinator in charge of the course
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - True if there was an error else false.
 * @param {String} [res.message] - Assigned if error = true, contains the error message.
 * @param {Bool} [res.data] - Assigned if error = false, Always true. 
 */
const changeCapacitador = async (firestore, req, res) => {
	if(req.user.tipo=='coordinador'){
		return res.send({
			error: true,
			message: 'No tienes acceso.'
		})
	}

	var { id, capacitador } = req.body;
    try {
        var memberSnap = await firestore.collection('logins').where('tipo', '==', 'capacitacion')
					.where('id', '==', capacitador).get();
        if (memberSnap.empty) return res.send({ error: true, message: 'Capacitador no existe', code: 1 });

        var capacitacionSnap = await firestore.collection('capacitaciones').doc(id).get('encargado');
        if (!capacitacionSnap.exists) return res.send({ error: true, message: 'Capacitacion no existe', code: 1 });

        await firestore.collection('capacitaciones').doc(id).update({ encargado: capacitador });
        return res.send({
            error: false,
            data: true
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}
/**
 * Deletes a document from the 'capacitacion' collection.
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {DELETE} req 
 * @param {String} req.params.id - The id of the course to delete. 
 * 
 * @param {JSON} res
 * @param {Bool} res.error - true if there was an error else false. 
 * @param {String} [res.message] - assigned if error = true, contains the error message. 
 * @param {Bool} [res.data] - assigned if error = false, always true.
 */
const deleteOne = async (firestore, req, res) => {
    var id = req.params.id;
    try {
        var capacitacionSnap = await firestore.collection('capacitaciones').doc(id).get();
        if (!capacitacionSnap.exists) return res.send({ error: true, message: 'Capacitacion no existe.', code: 1 });
		await firestore.collection('capacitaciones').doc(id).delete();
		
		var part = await firestore.collection('participantes').where('capacitacion', '==', id).get();
		let batch = firestore.batch();
		part.docs.forEach(a=>{
			batch.delete(a.ref);
		})
		await batch.commit();

        return res.send({
            error: false,
            data: true
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}
/**
 * Edits the course with the provided id
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {POST} req 
 * @param {JSON} req.body
 * @param {String} req.body.id
 * @param {String} req.body.nombre
 * @param {String} req.body.inicio - Start date of course, YYYY-MM-DD
 * @param {String} req.body.fin - End date of course, YYYY-MM-DD
 * 
 * @param {JSON} req.user - Containts information regarding the currently signed-in user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'coordinador',...
 * @param {Bool} req.user.admin - If the user is admin or not
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - True if there was an error 
 * @param {Number} [res.code] - Assigned if error = true. code = 999 when the user is not authoraized for that action. 
 * @param {String} [res.message] - Assigned if error = true. Containts the error message. 
 * @param {Bool} [res.data] - Assigned if error = false. Always true. 	
 */
const edit = async (firestore, req, res)=>{
    var { id, nombre, inicio, fin } = req.body;

    if(!req.user.admin && !req.user.tipo.startsWith('acompañante')){
		return res.send({
			error: true,
			code: 999,
			message: 'No tienes acceso a esta acción'
		})
	}

    try{
        inicio = firebase.firestore.Timestamp.fromDate(moment(inicio, 'YYYY-MM-DD').toDate())
        fin = firebase.firestore.Timestamp.fromDate(moment(fin, 'YYYY-MM-DD').toDate())
    }catch(e){
        return res.send({
            error: true, 
            message: 'Fechas no validas'
        })
    }

    try{
		var capRef = await firestore.collection('capacitaciones').doc(id);
        var capSnap = await capRef.get();
        if(!capSnap.exists) return res.send({
            error: true,
            message: 'Capacitación no existe.'
        });
		await capRef.update({ nombre, inicio, fin });
		return res.send({
			error: false,
			data: true
		})
    }catch(e){
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}


/* copy pasted code, cambio de var a const y grupos a capacitaciones */
/**
 * Returns the list of attendess for a course of a given date. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {String} req.params.id - Course id
 * @param {String} req.params.fecha - Date from which to find the attendance list, YYYY-MM-DD.
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - True if there is an error else false. 
 * @param {Number} [res.code] - Assigned if error = true. Code = 34 for 'Not found'.
 * @param {String} [res.message] - Assigned if error = true. Containts the error message. 
 * @param {JSON} [res.data] - Assigned if error = false. 
 * @param {Array<JSON>}  miembros - Array list of attendees.
 * @param {String} miembros[].id - user id of attendee.
 * @param {String} miembros[].nombre - name of attendee.
 * @param {Bool} miembros[].assist - true if member did attend the course on that day. 
 */
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

		const miembrosSnap = await firestore.collection('participantes').where('capacitacion', '==', groupSnap.id).where('eliminado', '==', false).get()
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
/**
 * Registers the list of attendees for a course in a particular date
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {POST} req 
 * @param {JSON} req.params
 * 
 * @param {String} req.params.id - Course id.
 * @param {JSON} req.body
 * @param {String} req.body.fecha - The date for the week currently being registered. YYYY-MM-DD.
 * @param {Array<String>} req.body.miembros - The array of attendee ids. 
 * @param {Bool} req.body.force - If true, it will override the previous list. 
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - true if there was an error else false.
 * @param {Number} [res.code] - Assigned if error = true. Code = 52 if an attendee list already exists for that date. 
 * @param {String} [res.message] - Assigned if error=true. Containts the error message. 
 * @param {String} [res.data] - Assigned if error = false. Contains the date of the registered attendee list. YYYY-MM-DD.
 */
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

/**
 * Registers the list of attendees for a course in a particular date
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {POST} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - Course id.
 * @param {String} req.params.fecha - The date of the attendance list being modified. YYYY-MM-DD.
 * 
 * @param {JSON} req.body
 * @param {Array<String>} [req.body.miembros] - The array of attendee ids. 
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - true if there was an error else false.
 * @param {String} [res.message] - Assigned if error=true. Containts the error message. 
 * @param {JSON} [res.data] - Assigned if error = false. 
 * @param {Bool} res.data.deleted - True if the previously registered asistance was deleted. 
 * @param {String} res.data.fecha - Contains the date that was updated. YYYY-MM-DD.
 */
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

/**
 * Retrieves the information of a document from the 'capacitaciones' collection. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - Course id.
 * 
 * @param {JSON} res 
 * @param {Bool} res.error - true if there was an error else false.
 * @param {String} [res.message] - Assigned if error=true. Containts the error message. 
 * @param {JSON} [res.data] - Assigned if error = false. 
 * @param {String} res.data.id  - Course id. 
 * @param {Array<JSON>} res.data.participantes
 * @param {String} res.data.participantes.id  - Attendee id. 
 * @param {String} res.data.participantes.nombre  - Attendee name. 
 * @param {String} res.data.participantes.appellido_paterno  - Attendee middle name. 
 * @param {String} res.data.participantes.appellido_materno  - Attendee last name. 
 * @param {Array<Array>} res.data.asistencias - An array that contains all the attendance lists. 
 * @param {Array<String>} res.data.asistencias[].YYYY-MM-DD - Array of attendee ids for a particular date. 
 * @param {String} res.data.encargado - The userid of the staff in charge of that course. 
 * @param {String} res.data.inicio - The starting date for the course. 
 * @param {String} res.data.fin - THe end date for the course. 
 */
const getone = async (firestore, req, res)=>{
	const id = req.params.id
	const snapshot = await firestore.collection('capacitaciones').doc(id).get()
	if(!snapshot.exists){
		return res.send({
			error: true, 
			message: 'no existe capacitacion con ese id'
		})
	}

	const partSnap = await firestore.collection('participantes').where('capacitacion', '==', id).where('eliminado', '==', false).get();
	var participantes = partSnap.docs.map(a=>{
		var p = a.data();
		return {
			id: a.id,
			nombre: p.nombre,
			apellido_paterno: p.apellido_paterno,
			apellido_materno: p.apellido_materno
		}
	})

	const asistSnap = await firestore.collection('capacitaciones/'+id+'/asistencias').get();
	var asistencias = asistSnap.docs.map(a=>a.id);

	res.send({
		error: false, 
		data: {
			id: snapshot.id,
			participantes,
			asistencias,
			...snapshot.data()
		}
	})
}

/**
 * Returns the document information of all participants for a specific course. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - Course id.
 *
 * @param {JSON} res
 * @param {Bool} res.error - True if there was an error else false. 
 * @param {String} [res.message] - Assigned if error = true. Contains the error message. 
 * @param {JSON} [res.data]  
 * @param {String} res.data.id  - The id of the course participant. 
 * @param {String} res.data.name
 * @param {String} res.data.apellido_paterno
 * @param {String} res.data.apellido_materno
 */
const getParticipantes = async (firestore, req, res)=>{
	var { id } = req.params;
	try{
		const partSnap = await firestore.collection('participantes').where('capacitacion', '==', id).where('eliminado', '==', false).get();
		var participantes = partSnap.docs.map(a=>{
			var p = a.data();
			return {
				id: a.id,
				nombre: p.nombre,
				apellido_paterno: p.apellido_paterno,
				apellido_materno: p.apellido_materno
			}
		})
	
		return res.send({
			error: false,
			data: participantes
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Mensaje inesperado.'
		})
	}
}

/**
 * Returns the document information of all participants for a specific course. If the user is admin, it returns all the information of all the courses. If the user is a staff member, then it will only return the information of the courses the user is in charge of. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.user - Conains information about the currently logged user. 
 * @param {String} req.user.id - The id of the currently logged user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'participante', ...
 * @param {String} req.user.admin - True if the user has admin priviledges. 
 *
 * @param {JSON} res
 * @param {Bool} res.error - True if there was an error else false. 
 * @param {String} [res.message] - Assigned if error = true. Contains the error message. 
 * @param {JSON} [res.data] 
 * @param {String} res.data.id - The document id. 
 * @param {String} res.data.encargado - The id of the staff in charge of that course. 
 * @param {String} res.data.inicio - The starting date for the course. 
 * @param {String} res.data.fin - THe end date for the course. 
 */
const getall = async (firestore, req, res)=>{
	var snapshot;
	if(req.user.admin || req.user.tipo.startsWith('acompañante')){
		snapshot = await firestore.collection('capacitaciones').get();
	}else{
		snapshot = await firestore.collection('capacitaciones').where('encargado', '==', req.user.id).get();
	}
	const docs = snapshot.docs.map(doc =>{
		return {
			id: doc.id,
			...doc.data()
		}
	})
	return res.send({
		error:false, 
		data: docs
	})
}


/**
 * Returns the full information of all course participants for a particular course in csv stream format. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - The id of the course. 
 * @param {JSON} req.user - Conains information about the currently logged user. 
 * @param {String} req.user.id - The id of the currently logged user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'participante', ...
 * @param {String} req.user.admin - True if the user has admin priviledges. 
 *
 * @param {JSON} res
 * @param {Bool} res.error - True if there was an error else false. 
 * @param {String} [res.message] - Assigned if error = true. Contains the error message. 
 * @param {JSON} [res.data] - CSV stream data. 
 */
const getAsistenciasReport = async (firestore, req, res)=>{
    var miembros = await firestore.collection('participantes').where('capacitacion', '==', req.params.id).where('eliminado', '==', false).get();
    var headers = ['IDMiembro', 'Nombre Corto', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Fecha nacimiento', 'Fecha registro', 'Correo electrónico', 'Sexo', 'Escolaridad', 'Oficio', 'Estado Civil', 'Domicilio', 'Colonia', 'Municipio', 'Telefono Movil', 'Telefono Casa'];
    var values = []
    for(var i of miembros.docs){
        if(!i.exists) continue;
        var d = i.data();
        values.push([
            i.id,
            d.nombre_corto,
            d.nombre,
            d.apellido_paterno,
            d.apellido_materno,
            (d.fecha_nacimiento && d.fecha_nacimiento._seconds ? (moment.unix(d.fecha_nacimiento._seconds).format('YYYY-MM-DD')) : ''),
            (d.fecha_registro && d.fecha_registro._seconds ? (moment.unix(d.fecha_registro._seconds).format('YYYY-MM-DD')) : ''),
            d.email,
            d.sexo,
            d.escolaridad,
            d.oficio,
            d.estado_civil,
            d.domicilio.domicilio,
            d.domicilio.colonia,
            d.domicilio.municipio,
            d.domicilio.telefono_movil,
            d.domicilio.telefono_casa
        ]);
    }

    var csv = Util.toXLS(headers, values);
    
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Participantes-'+req.params.id+'.xls')

    return csv.pipe(res);
}

/**
 * Returns the attendance record and general information information of all participants for a particular course in csv stream format. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - The id of the course. 
 * @param {JSON} req.user - Conains information about the currently logged user. 
 * @param {String} req.user.id - The id of the currently logged user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'participante', ...
 * @param {String} req.user.admin - True if the user has admin priviledges. 
 *
 * @param {JSON} res
 * @param {Bool} res.error - True if there was an error else false. 
 * @param {String} [res.message] - Assigned if error = true. Contains the error message. 
 * @param {JSON} [res.data] - CSV stream data. 
 */
const getAsistenciasAsistanceReport = async (firestore, req, res)=>{
    var groupRef = await firestore.collection('capacitaciones').doc(req.params.id);
    var assistColl = await groupRef.collection('asistencias');
    var assistList = await assistColl.get();
    var dates = []
    assistList.docs.forEach(a=>{
        if(!a.exists) return;
        dates.push({
            date: a.id,
            members: a.data().miembros
        })
	});
	
	var partSnap = await firestore.collection('participantes').where('capacitacion', '==', req.params.id).where('eliminado', '==', false).get();

	var members_id = [...new Set([...dates.map(a=>a.members), ...partSnap.docs.map(a=>a.id)])];
	var members = [];
	if(members_id.length>0){
		const asistSnap = await firestore.getAll(...members_id.map(a=>firestore.doc('participantes/'+a)));
		asistSnap.forEach(a=>{
			if(a.exists){
				var m = a.data();
				members.push({ 
					id: a.id, 
					nombre_corto: m.nombre_corto, 
					nombre: m.nombre, 
					apellido_paterno: m.apellido_paterno,
					apellido_materno: m.apellido_materno
				})
			}
		});
	}

    var headers = ['IDMiembro', 'Nombre Corto', 'Nombre', 'Apellido Paterno', 'Apellido Materno', ...dates.map(a=>a.date)];
    var values = []
    for(var i of members){
        var date_assistance = dates.map(a=>(a.members.findIndex(v=>v==i.id)!=-1 ? 'X' : ''));
        values.push([
            i.id,
            i.nombre_corto,
            i.nombre,
            i.apellido_paterno,
            i.apellido_materno,
            ...date_assistance
        ])
		}
    
    var csv = Util.toXLS(headers, values);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Asistencia.xls')
    return csv.pipe(res);
}

/**
 * Returns all data regarding courses in csv stream data. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance.
 * @param {GET} req 
 * @param {JSON} req.params
 * @param {String} req.params.id - The id of the course. 
 * @param {JSON} req.user - Conains information about the currently logged user. 
 * @param {String} req.user.id - The id of the currently logged user
 * @param {String} req.user.tipo - The kind of user: 'acompañante', 'participante', ...
 * @param {String} req.user.admin - True if the user has admin priviledges. 
 *
 * @param {JSON} res
 * @param {Bool} res.error - True if there was an error else false. 
 * @param {String} [res.message] - Assigned if error = true. Contains the error message. 
 * @param {JSON} [res.data] - CSV stream data. 
 */
var dump = async (firestore, req, res)=>{
    try{
        var capSnap = await firestore.collection('capacitaciones').get();
				
				var capacitadores = [];
				const loginSnap = await firestore.collection('logins').where('tipo', '==', 'capacitacion').get();
				for (l of loginSnap.docs) {
					const info = await firestore.collection('admins').doc(l.data().id).get();
					if (!info.data().apellido_materno) {
						capacitadores.push({
							id: l.data().id,
							email: l.id,
							apellido_materno: '',
							...info.data()
						})
					} else {
						capacitadores.push({
							id: l.data().id,
							email: l.id,
							...info.data()
						})
					}
					
				}

        var capacitaciones = []
        capSnap.docs.forEach(a=>{
            if(!a.exists) return;
            var d = a.data();
            var cap = capacitadores.find(a=>a.id==d.encargado);
            capacitaciones.push([
                a.id,
                d.nombre,
                cap.id,
				`${cap.nombre} ${cap.apellido_paterno} ${cap.apellido_materno}`,
				cap.email,
				(d.inicio && d.inicio._seconds) ? moment.unix(d.inicio._seconds).format('YYYY-MM-DD') : '',
				(d.fin && d.fin._seconds) ? moment.unix(d.fin._seconds).format('YYYY-MM-DD') : ''
            ]);
        });

        var headers = [ 'IDCapacitacion', 'Nombre', 'IDCoordinador', 'Coordinador', 'Email', 'Fecha inicio', 'Fech fin' ];
        var csv = Util.toXLS(headers, capacitaciones);

        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.attachment('Capacitaciones.xls')
        return csv.pipe(res)
    }catch(e){
		console.log(e);
        // return res.redirect('back');
    }
}

/**
 * Get all logins with type capacitacion
 */
const getCapacitadores = async (firestore, req, res) => {
	var logins = [];
	const loginSnap = await firestore.collection('logins').where('tipo', '==', 'capacitacion').get();
	for (l of loginSnap.docs) {
		const info = await firestore.collection('admins').doc(l.data().id).get();
		if (!info.data().apellido_materno) {
			logins.push({
				id: l.data().id,
				email: l.id,
				apellido_materno: '',
				...info.data()
			})
		} else {
			logins.push({
				id: l.data().id,
				email: l.id,
				...info.data()
			})
		}
		
	}

	return res.send({
		error: false,
		data: logins,
	})
}

module.exports = {
	add,
	getAsistencia,
	registerAsistencia,
	saveAsistencia,
	getone, 
	getall,
	changeCapacitador,
	edit,
	deleteOne,
	getAsistenciasReport,
	getAsistenciasAsistanceReport,
	getParticipantes,
	getCapacitadores,
	dump
}