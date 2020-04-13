const express = require('express')

const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('zonas').get()
    try{
        const docs = snapshot.docs.map(doc =>{
            return {
                id: doc.id, 
                nombre: doc.data().nombre
            }
        })
        res.send({
            error: false, 
            zonas: docs
        })
    }catch(err){
        res.send({
            error: true, 
            message: error.message
        })
    }
}

const add = async (firebase, req, res)=>{
    const nuevaZona = {
        nombre: req.body.nombre, 
        decanatos: req.body.decanato
    }
    const collrectionref = await firebase.collection('zonas')
    try {
        const docref = await collrectionref.add(nuevaZona)
        res.send({
            error: false, 
            /**@description the id of the zona that was just added to the firestore */
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
    add: add
}

