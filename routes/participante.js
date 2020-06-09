/**
 * Module for managing participants
 * @module Participante 
*/

/** @type module:moment */
const moment = require('moment');
/** @type module:firebase */
const firebase = require('firebase-admin')

/**
 * Adds a new document in the 'participantes' collection with the provided information in the request.body
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req  
 * @param {String} req.body.nombre 
 * @param {String} req.body.apellido_materno 
 * @param {String} req.body.apellido_paterno 
 * @param {String} req.body.nombre_corto 
 * @param {String} req.body.fecha_nacimiento
 * @param {String} req.body.estado_civil  
 * @param {String} req.body.sexo 
 * @param {String} req.body.email
 * @param {String} req.body.escolaridad  
 * @param {String} req.body.oficio 
 * @param {String} req.body.capacitacion
 * @param {String} req.body.domicilio
 * 
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - True if there was an error else false 
 * @param {String} [res.message] - only assigned if there was an error, contains the error message 
 * @param {JSON} [res.data] - If there was no error, will be be assigned
 * @param {String} res.data.nombre 
 * @param {String} res.data.apellido_materno 
 * @param {String} res.data.apellido_paterno 
 * @param {String} res.data.nombre_corto 
 * @param {String} res.data.fecha_nacimiento
 * @param {String} res.data.estado_civil  
 * @param {String} res.data.sexo 
 * @param {String} res.data.email
 * @param {String} res.data.escolaridad  
 * @param {String} res.data.oficio 
 * @param {String} res.data.capacitacion
 * @param {String} res.data.domicilio
 */
const add = async(firestore, req, res)=>{
    const {
        nombre, 
        apellido_materno, 
        apellido_paterno, 
        nombre_corto, 
        fecha_nacimiento,
        estado_civil,  
		sexo, 
		email,
        escolaridad , 
        oficio, 
		capacitacion,
		domicilio
	} = req.body

   	//validar capacitacion 
   	const snapshot = await firestore.collection('capacitaciones').doc(capacitacion).get()
	if (!snapshot.exists){
       	return res.send({
           error: false, 
           message: 'no hay capacitacion con ese id'
       	})
   	}

   	var fn = firebase.firestore.Timestamp.fromDate(moment(fecha_nacimiento, 'YYYY-MM-DD').toDate())
   
   	var newPart = await firestore.collection('participantes').add({
		nombre,
		apellido_paterno,
		apellido_materno,
		nombre_corto,
		fecha_nacimiento: fn,
		estado_civil,
		sexo,
		email,
		escolaridad,
		oficio,
		domicilio,
        capacitacion,
        eliminado: false
	})
   	return res.send({
       error: false, 
       data: newPart.id
   	})
}

/**
 * Edits a document id the specified body.id in the collection 'participantes' with the data provided in the request.body
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req  
 * @param {String} req.body.id 
 * @param {String} req.body.nombre 
 * @param {String} req.body.apellido_materno 
 * @param {String} req.body.apellido_paterno 
 * @param {String} req.body.nombre_corto 
 * @param {String} req.body.fecha_nacimiento
 * @param {String} req.body.estado_civil  
 * @param {String} req.body.sexo 
 * @param {String} req.body.email
 * @param {String} req.body.escolaridad  
 * @param {String} req.body.oficio 
 * @param {String} req.body.capacitacion
 * @param {String} req.body.domicilio
 * 
 * @param {JSON} res - Status 200
 * @param {Bool} res.error
 * @param {String} [res.message]
 * @param {Bool} [res.data] - will be assigned if no error, True if edit was successful
 */
const edit = async (firestore, req, res)=>{
    const {
        id,
        nombre, 
        apellido_materno, 
        apellido_paterno, 
        nombre_corto, 
        fecha_nacimiento,
        estado_civil,  
		sexo, 
		email,
        escolaridad, 
        oficio, 
		domicilio
	} = req.body
    
    //validate participante
    const usersnap = await firestore.collection('participantes').doc(id).get() 
    if(!usersnap.exists){
        return res.send({
            error: true, 
            message: 'no hay participante con ese id'
        })
    }

    var fn = firebase.firestore.Timestamp.fromDate(moment(fecha_nacimiento, 'YYYY-MM-DD').toDate())

    const result = await firestore.collection('participantes').doc(id).set({
        nombre,
		apellido_paterno,
		apellido_materno,
		nombre_corto,
		fecha_nacimiento: fn,
		estado_civil,
		sexo,
		email,
		escolaridad,
		oficio,
		domicilio,
    }, {merge: true})

    if(!result){
        return res.send({
            error: true, 
            message: 'error writing to db'
        })
    }

    return res.send({
        error: false, 
        data: true
    })
}
/**
 * Gets the document with the specified id
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req 
 * @param {String} req.params.id - the id of the document to retrieve
 * 
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - true if there was an error, else false. 
 * @param {String} [res.message] - Assigned only if error, includes de error message
 * @param {JSON} [res.data] - Assigned only if no error
 * @param {String} res.data.id 
 * @param {String} res.data.nombre 
 * @param {String} res.data.apellido_materno 
 * @param {String} res.data.apellido_paterno 
 * @param {String} res.data.nombre_corto 
 * @param {String} res.data.fecha_nacimiento
 * @param {String} res.data.estado_civil  
 * @param {String} res.data.sexo 
 * @param {String} res.data.email
 * @param {String} res.data.escolaridad  
 * @param {String} res.data.oficio 
 * @param {String} res.data.capacitacion
 * @param {String} res.data.domicilio
 */
var getone = async (firestore, req, res)=>{
    var { id } = req.params;
    const usersnap = await firestore.collection('participantes').doc(id).get() 
    if(!usersnap.exists){
        return res.send({
            error: true, 
            message: 'El participante no existe.'
        })
    }

    return res.send({
        error: false,
        data: {
            id: usersnap.id,
            ...usersnap.data()
        }
    })
}

/**
 * Updates the status of a document from collection 'participantes' to 'eliminado' 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req 
 * @param {String} req.params.id - id of document to remove
 * 
 * @param {JSON} res - Status 200
 * @param {Bool} res.error
 * @param {String} [res.message]
 * @param {Bool} [res.data]  - always true
 */
var remove = async (firestore, req, res)=>{
    var { id } = req.params;
    const usersnap = await firestore.collection('participantes').doc(id).get();
    if(!usersnap.exists){
        return res.send({ error: false, data: true });
    }
    await firestore.collection('participantes').doc(id).update({
      eliminado: true  
    });
    return res.send({
        error: false,
        data: true
    })
}

module.exports = {
    add: add,
    edit: edit,
    getone,
    remove
}