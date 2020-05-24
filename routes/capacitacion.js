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

const changeCoordinador = async (firestore, req, res) => {
    var id = req.params.id;
    var { coordinadorId } = req.body;
    try {
        var memberSnap = await firestore.collection('miembros').doc(coordinadorId).get('nombre');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe', code: 1 });

        var capacitacionSnap = await firestore.collection('capacitaciones').doc(id).get('encargado');
        if (!capacitacionSnap.exists) return res.send({ error: true, message: 'Capacitacion no existe', code: 1 });

        await firestore.collection('capacitaciones').doc(id).update({ encargado: coordinadorId });
        return res.send({
            error: false,
            data: capacitacionSnap.data()
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
        if (!capacitacionSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        var capacitacion = capacitacionSnap.data();
        await firestore.collection('capacitaciones').doc(id).delete();
        return res.send({
            error: false,
            data: capacitacion
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const deleteMember = async (firestore, req, res) => {
    var id = req.params.id;
    try {
        var participantesSnap = await firestore.collection('participantes').doc(id).get();
        if (!participantesSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        var participantes = participantesSnap.data();
        await firestore.collection('participantes').doc(id).delete();
        return res.send({
            error: false,
            data: participantes
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
    add: add,
    changeCoordinador,
    deleteOne,
    deleteMember
}