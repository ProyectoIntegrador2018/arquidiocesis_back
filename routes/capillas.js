const add = async (firestore, req, res)=>{
    const newCapilla = {
        nombre: req.body.name, 
    	parroquia: req.body.parroquia,
		address: req.body.address
    }
    const collectionref = await firestore.collection('capillas')
    const parroquiaref = await firestore.collection('parroquias').doc(req.body.parroquia)
    //validate parroquia 
    const snapshot = await parroquiaref.get()
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'couldn\'t find parroquia with he given id'
        })
    }
    //--- add self to parroquia  --- // 
    // -----------VVVVVVV----------- //

    let capillas = snapshot.data().capillas //find stored data 
    const docref = await collectionref.add(newCapilla) // add new capilla to capillas collection
    if (capillas) {capillas.push(docref.id)} // create new array if it doesn't exists
    else { capillas = [docref.id] }
        
    //rewrite with new data in parroquias
    try{ await parroquiaref.set({capillas: capillas}, {merge: true})
    } catch(err){
        return res.send({
            error: true, 
            message: 'unexpected error while adding new capilla to capillas list in parroquia',
            details: err.message
        })
    }
   
    // --------- success ----------//
    // ----------VVVVVVV-----------//
    res.send({
        error: false, 
        data: {
			id: docref.id,
			nombre: req.body.name, 
        	parroquia: req.body.parroquia
		}
    })
}


const remove = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('capillas').doc(req.params.id).get()
    if (!snapshot.exists)
        return res.send({
            error: true, 
            message: 'la capilla con ese ID no existe'
        })
    await firestore.collection('capillas').doc(req.params.id).delete()
    res.send({
        error: false, 
        data: snapshot.data()
    })
}

const getone = async (firestore, req, res)=>{
    // validate capilla 
    const snapshot = await firestore.collection('capillas').doc(req.params.id).get()
    if(!snapshot){
        return res.send({
            error: true, 
            message: 'no existe una capilla con ese id'
        })
    }
    res.send({
        error: false, 
        data: snapshot.data()
    })

}

module.exports = {
    add: add, 
    remove: remove,
    getone: getone
}