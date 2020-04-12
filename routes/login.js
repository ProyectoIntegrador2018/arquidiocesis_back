const express = require('express')

const authenticate = async (firestore, req, res)=>{
    try{
        // get collection reference 
        const collection = await firestore.collection('logins')
        // get document reference 
        const user = await collection.doc(`${req.body.correo}`)
        // validate document
        const snapshot = await user.get()
        if (snapshot.exists){ // since id is email, this validates email 
            const data = snapshot.data() //read the doc data 
            if (data.contraseña == req.body.contraseña){ //validate password 
                const result = JSON.stringify({
                    id: data.id, 
                    tipo: data.tipo
                })
                console.log(result)
                res.send(result).status(200) // user authenticated
            }else{
                console.log(data.contraseña)
                console.log(REQ.body.contraseña)
                res.send('wrong password').status(401)
            }
        }else{
            res.send('coundl\'t find user registered under that email').status(401)
        }
    } catch(err){
        console.log(err)
        res.send('something went wrong').status(400)
    }
    // check password 
}

module.exports = {
    authenticate: authenticate
}