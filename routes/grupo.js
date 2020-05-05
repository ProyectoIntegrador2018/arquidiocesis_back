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
	var miembrosSnap = await firestore.collection('miembros').where('grupo', '==', snapshot.id).get();
	var miembros = []
	miembrosSnap.forEach(a=>{
		if(!a.exists) return;
		miembros.push({ id: a.id, nombre: a.data().nombre });
	})
	grupo.miembros = miembros;

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
        // await firestore.collection("grupos").doc(grupo).update({
        //     miembros: [...groupSnap.get('miembros'), new_member.id]
        // });

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

const getMember = async (firestore, req, res) => {
    var id = req.params.id;
    console.log(id);
    try {
        var memberSnap = await firestore.collection('miembros').doc(id).get();
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        var member = memberSnap.data();
        return res.send({
            error: false,
            data: member
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const getMemberFicha = async (firestore, req, res) => {
    var id = req.params.id;
    try {
        var seguroSnap = await firestore.collection('miembros').doc(id).collection('ficha medica').doc('seguro').get();
        var historialSnap = await firestore.collection('miembros').doc(id).collection('ficha medica').doc('historial').get();
        if (!historialSnap.exists || !seguroSnap.exists)
            return res.send({ error: true, message: 'Miembro no existe o no tiene ficha medica', code: 1 });

        var alergiasSnap = await firestore.collection('miembros').doc(id).collection('ficha medica').doc('historial').collection('alergias').get();
        var enfermedadesSnap = await firestore.collection('miembros').doc(id).collection('ficha medica').doc('historial').collection('enfermedades').get();
        var tratamientosSnap = await firestore.collection('miembros').doc(id).collection('ficha medica').doc('historial').collection('tratamientos').get();

        var alergias = alergiasSnap.docs.map(doc => ({ id: "alergias", ...doc.data() }));
        var enfermedades = enfermedadesSnap.docs.map(doc => ({ id: "enfermedades", ...doc.data() }));
        var tratamientos = tratamientosSnap.docs.map(doc => ({ id: "tratamientos", ...doc.data() }));


        var seguro = seguroSnap.data;
        return res.send({
            error: false,
            Seguro: seguro,
            Alergias: alergias,
            Enfermedades: enfermedades,
            Tratamientos: tratamientos
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const editMember = async (firestore, req, res) => {
	var id = req.params.id;
    var { name, grupo, age, gender, email, estatus } = req.body;
    try {
        var groupSnap = await firestore.collection('grupos').doc(grupo).get('miembros');
        if (!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
        var memberSnap = await firestore.collection('miembros').doc(id).get('nombre');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        var edited_member = {
            nombre: name,
            edad: parseInt(age),
            grupo,
            sexo: gender,
            email,
            coordinador: false,
            id,
            estatus
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
            message: 'Error inesperado.'
        })
    }
}

const editMemberGroup = async (firestore, req, res) => {
	var miembro_id = req.params.id;
    var { grupo_id } = req.body;
    try {
        var groupSnap = await firestore.collection('grupos').doc(grupo_id).get('miembros');
        if (!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
        var memberSnap = await firestore.collection('miembros').doc(miembro_id).get('nombre');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        await firestore.collection('miembros').doc(miembro_id).update({ grupo: grupo_id });
        return res.send({
            error: false,
            data: req.body
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const editMemberStatus = async (firestore, req, res) => {
	var id = req.params.id;
    var { status } = req.body;
    try {
        var memberSnap = await firestore.collection('miembros').doc(id).get('estatus');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe o no tiene un campo de estatus', code: 1 });
        await firestore.collection('miembros').doc(id).update({ estatus: status });
        return res.send({
            error: false,
            data: memberSnap.data()
        })
    } catch (err) {
        console.log(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

module.exports = {
    getall, 
    getone, 
    add,
    addMember,
    editMember,
    editMemberGroup,
    editMemberStatus,
    getMember,
    getMemberFicha
}