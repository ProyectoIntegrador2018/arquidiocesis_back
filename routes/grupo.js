const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('grupos').get();
	var grupos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	if(grupos.length>0){
		var snapParroquias = await firestore.getAll(...grupos.map(a=>firestore.doc('parroquias/'+a.parroquia)));
		var parroquias = snapParroquias.map(a=>({ id: a.id, nombre: a.data().nombre }));

		for(var i of grupos){
			i.parroquia = parroquias.find(a=>a.id==i.parroquia).nombre;			
		}
	}

    res.send({
        error: false, 
        data: grupos
    })
}

const getone = async (firestore, req, res)=>{
	const snapshot = await firestore.collection('grupos').doc(req.params.id).get();
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'there is no group with that id'
        })
	}

	var grupo = snapshot.data();
	if(grupo.miembros && grupo.miembros.length>0){
		const miembrosSnap = await firestore.getAll(...grupo.miembros.map(a=>firestore.doc('miembros/'+a)));
		grupo.miembros = miembrosSnap.map(a=>({ id: a.id, ...a.data() }));
	}

    res.send({
        error: false, 
        data: grupo
    })
}

const add = async (firestore, req, res)=>{
    let snapshot = undefined
    const parroquia = req.body.parroquia
    const capilla = req.body.capilla
    const coordinator = req.body.coordinator
    // validate request
    try{ 
        snapshot = await firestore.collection('miembros').doc(coordinator).get() 
        if(!snapshot.exists || !snapshot.data().coordinador) throw {message: 'no hay coordinador registrado con ese id'}
        if ((!parroquia && !capilla)|| (parroquia && capilla)) throw {message: 'group needs capilla OR parroquia'}
    } 
    catch(err){
        return res.send({
            error: true, 
            message: err.message
        })
    }

    //validate parroquia
    if (parroquia){
        const snapshot = await firestore.collection('parroquias').doc(parroquia).get()
        if (!snapshot.exists){
            return res.send({
                error: true, 
                message: 'no hay parroquia con ese id'
            })
        }
    }
    //validate capilla
    if(capilla){
        const snapshot = await firestore.collection('capillas').doc(capilla).get()
        if(!snapshot.exists){
            return res.send({
                error: true, 
                message: 'no hay capilla con ese id'
            })
        }
    }
    let newGroup = {
        coordinator,
        members: []
    }
    if (capilla)
        newGroup.capilla = capilla

    if (parroquia)
        newGroup.parroquia = parroquia

    const docref = await firestore.collection('grupos').add(newGroup)
    res.send({
        error: false, 
        data: docref.id
    })
}

module.exports = {
    getall: getall, 
    getone: getone, 
    add: add
}