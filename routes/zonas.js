/**
 * Module for managing zones
 * @module Zones
 */

/**
 * Gets all the documents from the zonas collection. 
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req
 * @param {String} req.params.id - the id of the document to retrieve
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - true if there was an error, else false.
 * @param {String} [res.message] - Assigned only if error, includes de error message
 * @param {JSON} [res.data] - Assigned only if no error
 * @param {String} res.data.id
 * @param {String} res.data.nombre
 */
const getall = async (firestore, req, res) => {
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
            data: docs
        })
    }catch(err){
        res.send({
            error: true, 
            message: error.message
        })
    }
}

/**
 * Gets the document with the specified id
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req
 * @param {String} req.params.id - the id of the document to retrieve
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - true if there was an error, else false.
 * @param {String} [res.message] - Assigned only if error, includes de error message
 * @param {JSON} [res.data] - Assigned only if no error
 * @param {String} res.data.id
 * @param {String} res.data.decanatos
 * @param {String} res.data.parroaquias
 */
const getone = async (firestore, req, res) => {
    const collectionref = await firestore.collection('zonas')
    try {
        const docref = await collectionref.doc(req.params.id)
        const snapshot = await docref.get()

        if (snapshot.exists) {
            var dec = await firestore.collection('decanatos').where('zona', '==', snapshot.id);
            var snapDecanatos = await dec.get();
            var decanatos = []
            snapDecanatos.forEach(doc => {
                var d = doc.data();
                decanatos.push({
                    id: doc.id,
                    nombre: d.nombre
                });
            });


            var parroquias = []
            var parr = await firestore.collection('parroquias').where('decanato', 'in', decanatos.map(a=>a.id));
            var parrSnap = await parr.get();
            
            parrSnap.forEach(doc => {
                var d = doc.data();
                parroquias.push({
                    id: doc.id,
                    nombre: d.nombre
                });
            });

            res.send({
                error: false,
                data: {
                    id: snapshot.id,
                    ...snapshot.data(),
                    decanatos,
                    parroquias
                }
            })
        } else {
            res.send({
                error: true,
                message: 'no existe zona con ese id'
            })
        }
    } catch (err) {
        res.send({
            error: true,
            message: err.message
        })
    }
}

/**
 * Adds a new document to the 'Zonas' collection
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {POST} req
 * @param {JSON} req.body
 * @param {String} req.body.nombre - name of the new zone
 *
 * @param {JSON} res
 * @param {Boolean} res.error - True if there was an error else false
 * @param {String} [res.message] - Assigned if error = true, contains the error message
 * @param {Number} [res.id] - Assigned if error = false, contains the id of the new zone
 */
const add = async (firebase, req, res)=>{
    const nuevaZona = {
        nombre: req.body.nombre
    }

    const collrectionref = await firebase.collection('zonas')
    try {
        const docref = await collrectionref.add(nuevaZona)
        res.send({
            error: false, 
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
    add,
    getall, 
    getone
}

