/** @module miembro
 * @description adds a new doc to collection 'miembros' and updates members list in specified group 
 * @param {firestore} firestore is an admin.firebase() instance from the firebase-admin module.
 * @returns {Object} {name, age, group, sex, email, coordinador} on success
 * @return {Object} {error, message} on fail 
 */
const add = async (firestore, req, res)=>{
    var { name, grupo, age, gender, email } = req.body;
    const groupSnap = await firestore.collection('grupos').doc(grupo).get('miembros');

    //validate group
    if(!groupSnap.exists) return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
    var new_member = {
        name: name,
        age: parseInt(age),
        group: grupo,
        sex: gender,
        email: email,
        coordinador: false
    }
    var memberRef = await firestore.collection('miembros').add(new_member); //add new member to collection 
    new_member.id = memberRef.id;

    try{ await firestore.collection("grupos").doc(grupo).update({ //add new member to group 
        miembros: [...groupSnap.get('miembros'), new_member.id]
    })}catch(err){return res.send({error: true, message: 'no se pudo actualizar lista de miembros'})}

    return res.send({
        error: false,
        data: new_member
    })
}

module.exports = {
    add: add
}