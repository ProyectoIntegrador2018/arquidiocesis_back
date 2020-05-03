const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
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
            message: 'Error inesperado.'
        })
    }
}

const getone = async(firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').doc(req.params.id).get()
    //validate parroquia 
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'No parroquia with that ID.'
        })
	 }
	var parroquia = snapshot.data();
	var capillas = []
	if(parroquia.capillas && parroquia.capillas.length>0){
		var ref = parroquia.capillas.map(a=>firestore.doc('capillas/'+a));
		const cap = await firestore.getAll(...ref);
		capillas = cap.map(a=>{
			return {...a.data(), id: a.id}
		});
	}
	if(parroquia.decanato){
		const dec = await firestore.doc('decanatos/'+parroquia.decanato).get();
		if(dec.exists) parroquia.decanato = dec.data().nombre;
		else parroquia.decanato = null;
	}
    res.send({
        error: false, 
        data: {
			nombre: parroquia.nombre,
			address: parroquia.address,
			decanato: parroquia.decanato,
			capillas
		}
    })
}

const add = async (firestore, req, res)=>{
    const nuevaParroquia = {
        nombre: req.body.name, 
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
				nombre: req.body.name, 
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

const remove = async (firestore, req, res)=>{
    //validate parroquia 
    const snapshot = await firestore.collection('parroquias').doc(req.params.id).get()
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'no existe un aparroquia con ese id'
        })
    }
    const capillas = snapshot.data().capillas // lista de ids de capilla
    const capillas_borradas = [] 
    if (capillas){
        for (let capilla of capillas){
            //validate capilla 
            const snapshot = await firestore.collection('capillas').doc(capilla).get()
            if (snapshot.exists){
                capillas_borradas.push({id: snapshot.id, ...snapshot.data()})
                await firestore.collection('capillas').doc(capilla).delete()
            }
        }
    }
    await firestore.collection('parroquias').doc(req.params.id).delete() 
    const parroquia = snapshot.data() 
    parroquia.capillas_borradas = capillas_borradas
    res.send({
        error: false, 
        data: {
            id: req.params.id, 
            ...parroquia
        }
    })
}

module.exports = {
    getall: getall, 
    getone: getone,
    add: add, 
    remove: remove
}

