const express = require('express')
/**
 * Module for managing Capacitations
 * @module Capacitaciones
 */

/**
 * Converts the data to be used in a csv file.
 */
const getall = async (firestore, req, res) =>{
    const snapshot = await firestore.collection('decanatos').get()
    const docs = snapshot.docs.map(doc => {
        const result = {
            id: doc.id,
            nombre: doc.data().nombre, 
            zona: doc.data().zona
        }
        return result
    })
    res.send({
        error: false, 
        data: docs
    }).status(200) 
}

/**
 * Converts the data to be used in a csv file.
 */
const getone = async (firestore, req, res)=>{
    const collectionref = await firestore.collection('decanatos')
    try{
        const docref = await collectionref.doc(req.params.id)
        const snapshot = await docref.get()
        if (snapshot.exists){
            var parr = await firestore.collection('parroquias').where('decanato', '==', snapshot.id);
            var snapParr = await parr.get();

            var parroquias = []
            snapParr.forEach(doc => {
                var d = doc.data();
                parroquias.push({
                    id: doc.id,
                    nombre: d.nombre
                });
            });

            res.send({
                error: false, 
                data: {
                    ...snapshot.data(),
                    parroquias
                }
            })
        }else{
            res.send({
                error: true, 
                message: 'no existe decanato con ese id'
            })
        }
    }catch(err){
        res.send({
            error: true, 
            message: err.message
        })
    }
}

module.exports = {
    getall: getall, 
    getone: getone
}