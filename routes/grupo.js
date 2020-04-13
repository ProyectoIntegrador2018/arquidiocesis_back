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