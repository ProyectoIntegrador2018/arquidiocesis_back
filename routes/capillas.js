const express = require('express')
const parroquia = require('./parroquia')

const add = async (firestore, req, res)=>{
    const newCapilla = {
        name: req.body.name, 
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

module.exports = {
    add: add
}