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
    var { name, parroquia, capilla, coordinador } = req.body;
    try{ 
        const snapshot = await firestore.collection('miembros').doc(coordinador).get() 
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
        nombre: name,
        coordinador,
        miembros: []
    }
    if (capilla)
        newGroup.capilla = capilla

    if (parroquia)
        newGroup.parroquia = parroquia

    const docref = await firestore.collection('grupos').add(newGroup)
    newGroup.id = docref.id;
    res.send({
        error: false, 
        data: newGroup
    })
}

const addMember = async (firestore, req, res)=>{
    var { name, grupo, age, gender, email } = req.body;
    try{
        var groupSnap = await firestore.collection('grupos').doc(grupo).get('miembros');
        if(!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
        var new_member = {
            nombre: name,
            edad: parseInt(age),
            grupo,
            sexo: gender,
            email,
            coordinador: false
        }
        var memberRef = await firestore.collection('miembros').add(new_member);
        new_member.id = memberRef.id;
        await firestore.collection("grupos").doc(grupo).update({
            miembros: [...groupSnap.get('miembros'), new_member.id]
        });

        return res.send({
            error: false,
            data: new_member
        })
    }catch(err){
        console.log(err);
        return res.send({
            error: true, 
            message: 'Error inesperado.'
        })
    }
}

const editMember = async (firestore, req, res) => {
    var { name, grupo, age, gender, email, id } = req.body;
    console.log(req.body);
    try {
        var groupSnap = await firestore.collection('grupos').doc(grupo).get('miembros');
        if (!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
        var edited_member = {
            nombre: name,
            edad: parseInt(age),
            grupo,
            sexo: gender,
            email,
            coordinador: false,
            id
        }
        await firestore.collection('miembros').doc(id).set(edited_member);
        return res.send({
            error: false,
            data: edited_member
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error esperado.'
        })
    }
}

module.exports = {
    getall, 
    getone, 
    add,
    addMember,
    editMember
}