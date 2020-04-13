const express = require('express')

const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
    try{
        const docs = snapshot.docs.map(doc =>{
            return {
                id: doc.id, 
                nombre: doc.data().nombre
            }
		  })
        res.send({
            error: false, 
            data: docs
        })
    }catch(err){
        res.send({
            error: true, 
            message: 'Error inesperado.'
        })
    }
}

const getone = async(firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').doc(req.params.id).get()
    //validate parroquia 
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'No parroquia with that ID.'
        })
	 }
	var parroquia = snapshot.data();
	var capillas = []
	if(parroquia.capillas && parroquia.capillas.length>0){
		var ref = parroquia.capillas.map(a=>firestore.doc('capillas/'+a));
		const cap = await firestore.getAll(...ref);
		capillas = cap.map(a=>{
			return {...a.data(), id: a.id}
		});
	}
	if(parroquia.decanato){
		const dec = await firestore.doc('decanatos/'+parroquia.decanato).get();
		if(dec.exists) parroquia.decanato = dec.data().nombre;
		else parroquia.decanato = null;
	}
    res.send({
        error: false, 
        data: {
			nombre: parroquia.nombre,
			address: parroquia['dirección'],
			decanato: '',
			capillas
		}
    })
}

const add = async (firestore, req, res)=>{
    const nuevaParroquia = {
        name: req.body.name, 
        address: req.body.address, 
        decanato: req.body.decanato
    }

    // --- validate decanato --- // 
   // ---VVVVVVVVVVVVVVVVVV---- //
    const snapshot = await firestore.collection('decanatos').doc(req.body.decanato).get()
    if (!snapshot.exists) {
        return res.send({
            error: true, 
            message: 'there is no decanato with that id'
        })
    }
    
    // --- Add new decanato --- // 
   // ----VVVVVVVVVVVVVVVV---- //
    const collrectionref = await firestore.collection('parroquias')
    try{ 
        const docref = await collrectionref.add(nuevaParroquia)
        res.send({
            error: false, 
            /**@description the id of the parroquia that was just added to the firestore */
            id: docref.id
        })
    }catch(err){
        res.send({
            error: true, 
            message: err.message
        })
    }
}

module.exports = {
    getall: getall, 
    getone: getone,
    add: add
}

