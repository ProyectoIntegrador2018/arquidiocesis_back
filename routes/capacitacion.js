const moment = require('moment');
const firebase = require('firebase-admin')
/*
    payload = {
        id, (string)
        encargado, (string)
        inicio, (string YYYY-MM-DD)
        fin (string YYYY-MM-DD)
    }

    // Date to Timestamp
    const t = firebase.firestore.Timestamp.fromDate(new Date());

    // Timestamp to Date
    const d = t.toDate();
*/

const add = async (firestore, req, res)=>{
    const payload = req.body.payload
    let id, encargado, inicio, fin
    try{
        id = payload.id
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
    let snapshot = await firestore.collection('capacitadores').doc(encargado).get()
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'No hay capacitador con eses id'
        })
    }

    //validar que no exista un grupo con ese id 
    snapshot = await firestore.collection('capacitaciones').doc(id).get()
    if (snapshot.exists){
        return res.send({
            error: true, 
            message: 'ya existe una capacitacion con ese id'
        })
    }

    try{
        const writeresult = await firestore.collection('capacitaciones').doc(id).set({
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

/*
    payload {
        id, (String)
        memberid, (String)
    }
*/

const addMember = async (firestore, req, res)=>{
}

module.exports = {
    add: add,
    addMember: addMember
}