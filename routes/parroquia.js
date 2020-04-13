const express = require('express')

const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
    try{
        const docs = snapshot.docs.map(doc =>{
            return {
                id: doc.id, 
<<<<<<< HEAD
                nombre: doc.data().nombre
=======
                name: doc.data().name
>>>>>>> 03a6d27acfb6839d8d1dc48bca0045ddb37e7a62
            }
        })
        res.send({
            error: false, 
<<<<<<< HEAD
            parroquias: docs
=======
            data: docs
>>>>>>> 03a6d27acfb6839d8d1dc48bca0045ddb37e7a62
        })
    }catch(err){
        res.send({
            error: true, 
            message: error.message
        })
    }
}

const add = async (firebase, req, res)=>{
    const nuevaParroquia = {
<<<<<<< HEAD
        nombre: req.body.nombre, 
        dirección: req.body.dirección, 
=======
        name: req.body.name, 
        address: req.body.address, 
>>>>>>> 03a6d27acfb6839d8d1dc48bca0045ddb37e7a62
        decanato: req.body.decanato
    }
    const collrectionref = await firebase.collection('parroquias')
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
    add: add
}

