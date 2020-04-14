/**  
 * @module parroquia
 * @description  retrieves all documents from collection 'parroquias'
 * @param {firestore} firestore is an admin.firebase() instance from the firebase-admin module.
 * @returns {Object[]} { error, data: {id, nombre}[] } on success
 * @returns {Object} { error, message } on fail
*/
const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
    const docs = snapshot.docs.map(doc =>{
        return {
            id: doc.id, 
            nombre: doc.data().nombre
        }
    })
    // --- success -- // 
   // --- VVVVVVV -- //
    res.send({
        error: false, 
        data: docs
    })
}

/**
 * @module parroquia
 * @description retrieves a single doc from collection 'parroquia'
 * @param {firestore} firestore is an admin.firebase() instance from the firebase-admin module
 * @returns {Object} {name, address, decanato, capilla} on success
 * @returns {Object} { error, message } on fail
 */
const getone = async(firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').doc(req.params.id).get()
    if (!snapshot.exists){ //validate parroquia
        return res.send({
            error: true, 
            message: 'No parroquia with that ID.'
        })
	 }
    var parroquia = snapshot.data();
	var capillas = []
	if(parroquia.capillas && parroquia.capillas.length>0){ //validate capilla
		var ref = parroquia.capillas.map(a=>firestore.doc('capillas/'+a)); //retrieve capillas
		const cap = await firestore.getAll(...ref);
		capillas = cap.map(a=>{
			return {...a.data(), id: a.id}
		});
	}
	if(parroquia.decanato){ //validate decanato 
		const dec = await firestore.doc('decanatos/'+parroquia.decanato).get(); //retrieve decanatos 
		if(dec.exists) parroquia.decanato = dec.data().nombre;
		else parroquia.decanato = null;
    }

    // --- success --- // 
   // --- VVVVVVV --- // 
    res.send({
        error: false, 
        data: {
			name: parroquia.nombre,
			address: parroquia.address,
			decanato: parroquia.decanato,
			capillas
		}
    })
}

/**
 * @module parroquia
 * @description creates a new document in 'parroquia' collection 
 * @param {firestore} firestore is an admin.firebase() instance from the firebase-admin module
 * @returns {Object} {id, name, address, decanato} on success
 * @returns {Object} { error, message } on fail 
 */
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
    
    // --- Add new parroquia --- // 
   // ----VVVVVVVVVVVVVVVV---- //
    const collrectionref = await firestore.collection('parroquias')
    try{ 
        const docref = await collrectionref.add(nuevaParroquia)
        res.send({
            error: false,
			data: {
				id: docref.id,
				name: req.body.name, 
				address: req.body.address, 
				decanato: req.body.decanato
			}
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

