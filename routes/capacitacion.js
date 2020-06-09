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
 * @param {Bool} req.error - True if there was an error else false.
 * @param {String} [req.message] - Assigned if error = true, contains the error message.
 * @param {Bool} [data] - Assigned if error = false, Always true. 
 */
const changeCoordinador = async (firestore, req, res) => {
	if(req.user.tipo=='coordinador'){
		return res.send({
			error: true,
			message: 'No tienes acceso.'
		})
	}

	var { id, coordinador } = req.body;
    try {
        var memberSnap = await firestore.collection('coordinadores').doc(coordinador).get('nombre');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Coordinador no existe', code: 1 });

        var capacitacionSnap = await firestore.collection('capacitaciones').doc(id).get('encargado');
        if (!capacitacionSnap.exists) return res.send({ error: true, message: 'Capacitacion no existe', code: 1 });

        await firestore.collection('capacitaciones').doc(id).update({ encargado: coordinador });
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
const getAsistenciasReport = async (firestore, req, res)=>{
    if(!req.user.admin){
        return res.sendStatus(404);
    }

    var miembros = await firestore.collection('participantes').where('capacitacion', '==', req.params.id).get();
    var headers = ['IDMiembro', 'Nombre Corto', 'Nombre', 'Apellido Paterno', 'Apellido Materno','Correo electrónico', 'Sexo', 'Escolaridad', 'Oficio', 'Estado Civil', 'Domicilio', 'Colonia', 'Municipio', 'Telefono Movil', 'Telefono Casa'];
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

    var csv = Util.toCSV(headers, values);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
    res.attachment('Participantes-'+req.params.id+'.csv')

    return csv.pipe(res);
}

const getAsistenciasAsistanceReport = async (firestore, req, res)=>{
    if(!req.user.admin){
        return res.redirect('back');
    }

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

	var members_id = [...new Set([...dates.map(a=>a.members).flat(), ...partSnap.docs.map(a=>a.id)])];
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
    
    var csv = Util.toCSV(headers, values);
    res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
    res.attachment('Asistencia.csv')
    return csv.pipe(res);
}

var dump = async (firestore, req, res)=>{
	if(!req.user.admin){
        return res.redirect('back');
    }

    try{
        var capSnap = await firestore.collection('capacitaciones').get();

        var coordIds = [...new Set(capSnap.docs.map(a=>a.data().encargado).filter(a=>(a ? true : false)))];
        var coordinadores = []
        if(coordIds.length>0){
            var coordSnap = await firestore.getAll(...coordIds.map(a=>firestore.doc('coordinadores/'+a)))
            coordSnap.forEach(a=>{
                if(!a.exists) return;
                coordinadores.push({
                    id: a.id,
                    ...a.data()
                });
            })
        }  

        var capacitaciones = []
        capSnap.docs.forEach(a=>{
            if(!a.exists) return;
            var d = a.data();
            var coord = coordinadores.find(a=>a.id==d.encargado);
            capacitaciones.push([
                a.id,
                d.nombre,
                coord.id,
				`${coord.nombre} ${coord.apellido_paterno} ${coord.apellido_materno}`,
				(d.inicio && d.inicio._seconds) ? moment.unix(d.inicio._seconds).format('YYYY-MM-DD') : '',
				(d.fin && d.fin._seconds) ? moment.unix(d.fin._seconds).format('YYYY-MM-DD') : ''
            ]);
        });

        var headers = [ 'IDCapacitacion', 'Nombre', 'IDCoordinador', 'Coordinador', 'Fecha inicio', 'Fech fin' ];
        var csv = Util.toCSV(headers, capacitaciones);

        res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
        res.attachment('Capacitaciones.csv')
        return csv.pipe(res)
    }catch(e){
		console.log(e);
        // return res.redirect('back');
    }
}

module.exports = {
    add,
    getAsistencia,
    registerAsistencia,
	saveAsistencia,
	getone, 
	getall,
	changeCoordinador,
	edit,
	deleteOne,
	getAsistenciasReport,
	getAsistenciasAsistanceReport,
	getParticipantes,
	dump
}