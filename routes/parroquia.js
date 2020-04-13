const express = require('express')

const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
    try{
        const docs = snapshot.docs.map(doc =>{
            return {
                id: doc.id, 
                name: doc.data().nombre
            }
		  })
        res.send({
            error: false, 
            data: docs
        })
    }catch(err){
        res.send({
            error: true, 
            message: error.message
        })
    }
}

const getone = async(firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').doc(req.params.id).get()
    //validate parroquia 
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'couldn\'t find parroquia with that id'
        })
    }
    res.send({
        error: false, 
        data: snapshot.data()
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

