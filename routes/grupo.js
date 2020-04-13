const getall = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('grupos').get()
    const docs = snapshot.docs.map(doc => doc.data())
    res.send({
        error: false, 
        data: docs
    })
}

const getone = async (firestore, req, res)=>{
    const snapshot = await firestore.collection('grupos').doc(req.params.id).get()
    if (!snapshot){
        return res.send({
            error: true, 
            message: 'there is no group with that id'
        })
    }
    res.send({
        error: false, 
        data: snapshot.data()
    })
}

const add = async (firestore, req, res)=>{
    let snapshot = undefined
    let members = [] 
    const parroquia = req.body.parroquia
    const capilla = req.body.capilla
    const coordinator = req.body.coordinator
    // validate request
    try{ 
        snapshot = await firestore.collection('miembros').doc(coordinator).get() 
        if(!snapshot.exists) throw {message: 'no hay coordinador registrado con ese id'}
        members  = req.body.members
        if (!members.includes(req.body.coordinator)) throw {message: 'coordinator must be a member'}
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
        members
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