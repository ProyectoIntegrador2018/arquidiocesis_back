const moment = require('moment');
const firebase = require('firebase-admin')

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
        eliminado: false,
        fecha_registro: new Date(),
	})
   	return res.send({
       error: false, 
       data: newPart.id
   	})
}

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