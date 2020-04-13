const express = require('express')

const add = async (firestore, req, res)=>{
    const newCapilla = {
        nombre: req.body.nombre, 
        parroquia: req.body.parroquia
    }
    const collectionref = await firestore.collection('capillas')
    try{
        const docref = await collectionref.add(newCapilla)
        res.send({
            error: false, 
            id: docref.id
        })
        // update parroquia 

    } catch(err){
        res.send({
            error: true, 
            message: err.message
        })
    }
}
