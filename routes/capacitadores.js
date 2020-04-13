const express = require('express')

const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('capacitadores').get()
    try{
        const docs = snapshot.docs.map(doc =>{
            return {
                id: doc.id, 
                nombre: doc.data().nombre
            }
        })
        res.send({
            error: false, 
            capacitadores: docs
        })
    }catch(err){
        res.send({
            error: true, 
            message: error.message
        })
    }
}

const add = async (firebase, req, res)=>{
    const nuevoCapacitador = {
        correo: req.body.correo,
        nombre: req.body.nombre
    }
    const collrectionref = await firebase.collection('capacitadores')
    try {
        const docref = await collrectionref.add(nuevoCapacitador)
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
    add: add
}

