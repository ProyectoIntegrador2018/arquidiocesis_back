const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('parroquias').get()
    try {
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
	// Conseguir información sobre capillas.
	if(parroquia.capillas && parroquia.capillas.length>0){
		var ref = parroquia.capillas.map(a=>firestore.doc('capillas/'+a));
		const cap = await firestore.getAll(...ref);
		cap.forEach(a=>{
			if(!a.exists) return;
			capillas.push({...a.data(), id: a.id})
		})
	}

    // Conseguir información sobre el decanato
	if(parroquia.decanato){
		const dec = await firestore.doc('decanatos/'+parroquia.decanato).get();
		if(dec.exists) parroquia.decanato = {
            nombre: dec.data().nombre,
            id: dec.id
        };
		else parroquia.decanato = null;
	}
    res.send({
        error: false, 
        data: {
            id: snapshot.id,
            ...parroquia,
			capillas
		}
    })
}

const add = async (firestore, req, res)=>{
    var {
        colonia,
        decanato,
        direccion,
        municipio,
        nombre,
        telefono1,
        telefono2
    } = req.body;

    var nuevaParroquia = {
        nombre,
        direccion,
        colonia,
        municipio,
        telefono1,
        telefono2,
        decanato
    }

    // --- validate decanato --- // 
   // ---VVVVVVVVVVVVVVVVVV---- //
    const snapshot = await firestore.collection('decanatos').doc(decanato).get()
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
        nuevaParroquia.id = docref.id;
        res.send({
            error: false,
			data: nuevaParroquia
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

const update = async (firestore, req, res)=>{
    try { 
        const payload = req.body
        const id = payload.parroquia
        const docref = firestore.collection('parroquias').doc(id)
        let snapshot = await docref.get()
        if (!snapshot.exists){
            return res.send({
                error: true, 
                message: "No hay parroquia con ese id"
            })
        }
        await docref.set({
            nombre: payload.nombre,
            direccion: payload.direccion, 
            colonia: payload.colonia, 
            municipio: payload.municipio, 
            telefono1: payload.telefono1, 
            telefono2: payload.telefono2, 
            decanato: payload.decanato
        }, {merge: true})
        snapshot = await docref.get()
        res.send({
            error: false, 
            data: snapshot.data()
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
    add: add, 
    remove: remove,
    udpate: update
}

