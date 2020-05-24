const moment = require('moment');
const firebase = require('firebase-admin')

const add = async (firestore, req, res)=>{
    const payload = req.body.payload
    let nombre, encargado, inicio, fin
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

module.exports = {
    add: add,
}