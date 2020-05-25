const moment = require('moment');
const firebase = require('firebase-admin')

const add = async(firestore, req, res)=>{
    const {
        nombre , 
        apellido_materno , 
        apellido_paterno , 
        nombre_corto , 
        fecha_nacimiento,
        estado_civil ,  
        genero ,  
        domicilio ,  
        colonia , 
        municipio , 
        telefono_casa , 
        telefono_movil , 
        correo , 
        escolaridad , 
        ocupacion, 
        capacitacion
    } = req.body.payload

   if ( !nombre || 
        !apellido_materno || 
        !apellido_paterno || 
        !nombre_corto || 
        !fecha_nacimiento||
        !estado_civil ||  
        !genero ||  
        !domicilio ||  
        !colonia || 
        !municipio || 
        !telefono_casa || 
        !telefono_movil || 
        !correo || 
        !escolaridad || 
        !ocupacion ||
        !capacitacion
   ){
        res.send({
            error: true, 
            message: 'missing values in payload'
        })
   }

   //validar capacitacion 
   const snapshot = await firestore.collection('capacitaciones').doc(capacitacion).get()
   if (!snapshot.exists){
       return res.send({
           error: false, 
           message: 'no hay capacitacion con ese id'
       })
   }

   req.body.payload.fecha_nacimiento = firebase.firestore.Timestamp.fromDate(moment(fecha_nacimiento, 'YYYY-MM-DD').toDate())
   
   await firestore.collection('participantes').add({
       ...req.body.payload
   })
   res.send({
       error: false, 
       message: 'ok'
   })
}

const edit = async (firestore, req, res)=>{
    const {
        participante,
        nombre , 
        apellido_materno , 
        apellido_paterno , 
        nombre_corto , 
        fecha_nacimiento,
        estado_civil ,  
        genero ,  
        domicilio ,  
        colonia , 
        municipio , 
        telefono_casa , 
        telefono_movil , 
        correo , 
        escolaridad , 
        ocupacion, 
        capacitacion
    } = req.body.payload   
    if ( !nombre || 
        !apellido_materno || 
        !apellido_paterno || 
        !nombre_corto || 
        !fecha_nacimiento||
        !estado_civil ||  
        !genero ||  
        !domicilio ||  
        !colonia || 
        !municipio || 
        !telefono_casa || 
        !telefono_movil || 
        !correo || 
        !escolaridad || 
        !ocupacion ||
        !capacitacion
   ){
        res.send({
            error: true, 
            message: 'missing values in payload'
        })
   }

    //validate participante
    const usersnap = await firestore.collection('participantes').doc(participante).get() 
    if(!usersnap.exists){
        return res.send({
            error: true, 
            message: 'no hay participante con ese id'
        })
    }

    //validar capacitacion 
    const capsnap = await firestore.collection('capacitaciones').doc(capacitacion).get()
    if (!capsnap.exists){
        return res.send({
            error: false, 
            message: 'no hay capacitacion con ese id'
        })
    }

    const result = await firestore.collection('participantes').doc(participante).set({
        nombre , 
        apellido_materno , 
        apellido_paterno , 
        nombre_corto , 
        fecha_nacimiento,
        estado_civil ,  
        genero ,  
        domicilio ,  
        colonia , 
        municipio , 
        telefono_casa , 
        telefono_movil , 
        correo , 
        escolaridad , 
        ocupacion, 
        capacitacion
    }, {merge: true})

    if(!result){
        return res.send({
            error: true, 
            message: 'error writing to db'
        })
    }

    res.send({
        error: false, 
        message: result.writeTime.toDate()
    })


}

module.exports = {
    add: add,
    edit: edit
}