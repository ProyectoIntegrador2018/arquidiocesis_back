const moment = require('moment');

const getall = async (firestore, req, res) => {
    const snapshot = await firestore.collection('grupos').get();
    var grupos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (grupos.length > 0) {
        // Get unique ids from parroquias and capillas
        var pid = Array.from(new Set(grupos.map(a => (a.parroquia || null)))).filter(a => a != null);
        var cid = Array.from(new Set(grupos.map(a => (a.capilla || null)))).filter(a => a != null);

        // Get parroquias
        var parroquias = [];
        if (pid.length > 0) {
            var snapParroquias = await firestore.getAll(...pid.map(a => firestore.doc('parroquias/' + a)));
            snapParroquias.forEach(a => {
                if (!a.exists) return;
                var d = a.data();
                parroquias.push({ id: a.id, nombre: d.nombre });
            })
        }

        // Get capillas
        var capillas = []
        if (cid.length > 0) {
            var snapCapillas = await firestore.getAll(...cid.map(a => firestore.doc('capillas/' + a)));
            snapCapillas.forEach(a => {
                if (!a.exists) return;
                var d = a.data();
                capillas.push({ id: a.id, nombre: d.nombre });
            })
        }

        for (var i of grupos) {
            if (i.parroquia) {
                i.parroquia = parroquias.find(a => a.id == i.parroquia);
            } else if (i.capilla) {
                i.capilla = capillas.find(a => a.id == i.capilla);
            }
        }
    }
    res.send({
        error: false,
        data: grupos
    })
}

const getone = async (firestore, req, res) => {
    const snapshot = await firestore.collection('grupos').doc(req.params.id).get();
    if (!snapshot.exists) {
        return res.send({
            error: true,
            message: 'there is no group with that id'
        })
    }

    var grupo = snapshot.data();

    // Query a información de los miembros
    var miembrosSnap = await firestore.collection('miembros').where('grupo', '==', snapshot.id).get();
    var miembros = []
    miembrosSnap.forEach(a => {
        if (!a.exists) return;
        miembros.push({ id: a.id, nombre: a.data().nombre });
    })
    grupo.miembros = miembros;

    if (grupo.parroquia) {
        // Grupo pertenece a parroquia, query a parroquia.
        var parrSnap = await firestore.collection('parroquias').doc(grupo.parroquia).get();
        if (parrSnap.exists) {
            grupo.parroquia = { id: parrSnap.id, nombre: parrSnap.data().nombre };
        } else grupo.parroquia = false;
    } else if (grupo.capilla) {
        // Grupo pertenece a capilla, query a capilla y su parroquia.
        var capSnap = await firestore.collection('capillas').doc(grupo.capilla).get();
        if (capSnap.exists) {
            grupo.capilla = { id: capSnap.id, nombre: capSnap.data().nombre };
            var parrSnap = await firestore.collection('parroquias').where('capillas', 'array-contains', capSnap.id).select('nombre').get();
            if (parrSnap.size > 0) {
                grupo.capilla.parroquia = { id: parrSnap.docs[0].id, nombre: parrSnap.docs[0].data().nombre };
            }
        } else grupo.capilla = false;
    }

    // Conseguir información sobre asistencias
    const asistenciasSnap = await firestore.collection('grupos/' + req.params.id + '/asistencias').get();
    var asistencias = asistenciasSnap.docs.map(doc => doc.id);
    grupo.asistencias = (asistencias || []);

    res.send({
        error: false,
        data: grupo
    })
}

const add = async (firestore, req, res) => {
    var { name, parroquia, capilla, coordinador } = req.body;
    try {
        const snapshot = await firestore.collection('miembros').doc(coordinador).get()
        if (!snapshot.exists || !snapshot.data().coordinador) throw { message: 'no hay coordinador registrado con ese id' }
        if ((!parroquia && !capilla) || (parroquia && capilla)) throw { message: 'group needs capilla OR parroquia' }
    }
    catch (err) {
        return res.send({
            error: true,
            message: err.message
        })
    }

    //validate parroquia
    if (parroquia) {
        const snapshot = await firestore.collection('parroquias').doc(parroquia).get()
        if (!snapshot.exists) {
            return res.send({
                error: true,
                message: 'no hay parroquia con ese id'
            })
        }
    }
    //validate capilla
    if (capilla) {
        const snapshot = await firestore.collection('capillas').doc(capilla).get()
        if (!snapshot.exists) {
            return res.send({
                error: true,
                message: 'no hay capilla con ese id'
            })
        }
    }
    let newGroup = {
        nombre: name,
        coordinador
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

const addMember = async (firestore, req, res) => {
    var { name, grupo, age, gender, email } = req.body;
    try {
        var groupSnap = await firestore.collection('grupos').doc(grupo).get('miembros');
        if (!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
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
    } catch (err) {
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
            grupo: grupo,
            sexo: gender,
            email: email,
            coordinador: false,
            id: id,
            estatus: estatus
        }
        await firestore.collection('miembros').doc(id).update(edited_member);
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

const getAsistencia = async (firestore, req, res) => {
    var { id, fecha } = req.params;
    try {
        var assist = await firestore.collection('grupos/' + id + '/asistencias').doc(fecha).get();
        if (!assist.exists) {
            return res.send({
                error: true,
                code: 34, // Arbitrary number
                message: 'No such assistance'
            });
        }
        var groupSnap = await firestore.collection('grupos').doc(id).get();
        if (!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
        if (groupSnap.get('miembros').length == 0 && assist.get('miembros').length == 0) {
            return res.send({
                error: false,
                data: {
                    miembros: []
                }
            });
        }
        var allMembers = Array.from(new Set([...groupSnap.get('miembros'), ...assist.get('miembros')]));
        const miembrosSnap = await firestore.getAll(...allMembers.map(a => firestore.doc('miembros/' + a)));
        var members = [];
        miembrosSnap.forEach(a => {
            if (a.exists) members.push({ id: a.id, nombre: a.data().nombre, assist: assist.get('miembros').findIndex(b => b == a.id) != -1 })
        });

        return res.send({
            error: false,
            data: {
                miembros: members
            }
        })

    } catch (err) {
        console.error(err);
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const registerAsistencia = async (firestore, req, res) => {
    var id = req.params.id;
    var { fecha, miembros, force } = req.body;

    var date = moment(fecha, 'YYYY-MM-DD');
    if (!date.isValid()) {
        return res.send({ error: true, message: 'Invalid date' })
    }

    var group = await firestore.collection('grupos').doc(id).get();
    if (!group.exists) {
        return res.send({
            error: true,
            message: 'Group doesnt exist'
        })
    }

    if (!force) {
        var oldAssistance = await await firestore.collection('grupos/' + id + '/asistencias').doc(fecha).get();
        if (oldAssistance.exists) {
            return res.send({
                error: true,
                code: 52, // Arbitrary number
                message: 'Assistance of that date already exists.'
            })
        }
    }

    try {
        await firestore.collection('grupos/' + id + '/asistencias').doc(date.format('YYYY-MM-DD')).set({ miembros });
        return res.send({
            error: false,
            data: date.format('YYYY-MM-DD')
        });
    } catch (err) {
        return res.send({
            error: true,
            message: 'Error inesperado.'
        })
    }
}

const saveAsistencia = async (firestore, req, res) => {
    var { id, fecha } = req.params;
    var { miembros } = req.body;

    var date = moment(fecha, 'YYYY-MM-DD');
    if (!date.isValid()) {
        return res.send({ error: true, message: 'Invalid date' })
    }

    try {
        if (!miembros || miembros.length == 0) {
            await firestore.collection('grupos/' + id + '/asistencias').doc(date.format('YYYY-MM-DD')).delete();
            return res.send({
                error: false,
                data: { deleted: true, date: date.format('YYYY-MM-DD') }
            })
        } else {
            await firestore.collection('grupos/' + id + '/asistencias').doc(date.format('YYYY-MM-DD')).set({ miembros });
            return res.send({
                error: false,
                data: { deleted: false, date: date.format('YYYY-MM-DD') }
            })
        }
    } catch (e) {
        console.error(e);
        return res.send({
            error: true,
            message: 'Unexpected error.'
        })
    }
}

const editMemberFicha = async (firestore, req, res) => {
    var { tipo_sangre, alergico, servicio_medico, ambulancia, padecimientos } = req.body;
    var id = req.params.id;
    try {
        var memberSnap = await firestore.collection('miembros').doc(id).get('nombre');
        if (!memberSnap.exists) return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
        var member = memberSnap.data();
        var edited_member = {
            tipo_sangre: tipo_sangre,
            alergico: alergico,
            servicio_medico: servicio_medico,
            ambulancia: ambulancia,
            padecimientos: padecimientos
        }
        await firestore.collection('miembros').doc(id).update(edited_member);
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

module.exports = {
    getall,
    getone,
    add,
    addMember,
    editMember,
    editMemberGroup,
    editMemberStatus,
    getMember,
    editMemberFicha,
    getAsistencia,
    registerAsistencia,
    saveAsistencia
}