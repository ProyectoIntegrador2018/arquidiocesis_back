const Util = require('./util');

const add = async (firestore, req, res)=>{
    var {
        nombre,
        direccion,
        colonia,
        municipio,
        telefono1,
        telefono2,
        parroquia
    } = req.body;

    const parroquiaref = await firestore.collection('parroquias').doc(parroquia)
    //validate parroquia 
    const snapshot = await parroquiaref.get()
    if (!snapshot.exists){
        return res.send({
            error: true, 
            message: 'couldn\'t find parroquia with he given id'
        })
    }

    const collectionref = await firestore.collection('capillas')
    const docref = await collectionref.add({
        nombre,
        direccion,
        colonia,
        municipio,
        telefono1,
        telefono2,
        parroquia: snapshot.id
    }) // add new capilla to capillas collection
   
    // --------- success ----------//
    // ----------VVVVVVV-----------//
    res.send({
        error: false, 
        data: docref.id
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

const edit = async (firestore, req, res)=>{
    const {id, nombre, direccion, colonia, municipio, telefono1, telefono2} = req.body
    if(!id || !nombre || !direccion|| !colonia|| !municipio){
        return res.send({
            error: true, 
            message: 'valores faltantes en el request'
        })
    }
    //validate que exista lo que se queire editar
    const snapshot = await firestore.collection('capillas').doc(id).get()
    if(!snapshot.exists){
        return res.send({
            error: true, 
            message: 'no hay capacitacion con ese id'
        })
    }
    const payload = {nombre, direccion, colonia, municipio, telefono1, telefono2}
    const result = await firestore.collection('capillas').doc(id).set(payload,{merge: true})
    if (!result){
        return res.send({
            error: true, 
            message: 'error al actualizar los datos'
        })
    }

    return res.send({
        error: false, 
        message: true
    })
}

const dump = async (firestore, req, res)=>{
    if(!req.user.admin){
        return res.redirect('back');
    }
    try{
        var capiSnap = await firestore.collection('capillas').get();
        var parroquiaId = [...new Set(capiSnap.docs.map(a=>a.data().parroquia))];
        var parrSnap = await firestore.getAll(...parroquiaId.map(a=>firestore.doc('parroquias/'+a)));
        var parroquias = []
        parrSnap.forEach(a=>{
            if(!a.exists) return;
            parroquias.push({
                id: a.id,
                ...a.data()
            });
        })

        var capillas = []
        capiSnap.docs.forEach(a=>{
            if(!a.exists) return;
            var d = a.data();
            var p = parroquias.find(b=>b.id==d.parroquia);
            if(!p) return;
            capillas.push([
                a.id,
                d.nombre,
                d.direccion,
                d.colonia,
                d.municipio,
                d.telefono1,
                d.telefono2,
                p.id,
                p.nombre
            ]);
        });

        var headers = ['IDCapilla', 'Nombre', 'Direccion', 'Colonia', 'Municipio', 'Telefono1', 'Telefono2', 'IDParroquia', 'Nombre Parroquia'];
        var csv = Util.toCSV(headers, capillas);
        res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
        res.attachment('Capillas.csv')
        return csv.pipe(res);
    }catch(e){
        console.log(e);
        return res.redirect('back');
    }
}

module.exports = {
    add: add, 
    remove: remove,
    getone: getone,
    edit: edit,
    dump: dump
}