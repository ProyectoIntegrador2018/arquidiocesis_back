const add = async (firestore, req, res)=>{
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

module.exports = {
    add: add
}