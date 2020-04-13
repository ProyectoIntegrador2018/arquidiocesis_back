const express = require('express')

const getall = async (firestore, req, res) =>{
    const snapshot = await firestore.collection('decanatos').get()
    const docs = snapshot.docs.map(doc => {
        const result = {
            id: doc.id, 
            name: doc.data().nombre, 
        }
        return result
    })
    res.send({
        error: false, 
        data: docs
    }).status(200) 
}

const getone = async (firestore, req, res)=>{
    const collectionref = await firestore.collection('decanatos')
    try{
        const docref = await collectionref.doc(req.params.id)
        const snapshot = await docref.get()
        console.log(snapshot)
        if (snapshot.exists){
            res.send({
                error: false, 
                data: snapshot.data()
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