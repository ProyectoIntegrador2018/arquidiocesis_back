const express = require('express')
const jwt = require('jsonwebtoken');

const SECRET = 'R?<=2vYPXm)n*_kd,Hp.W2GG[hD3b2D/';

const authenticate = async (firestore, req, res)=>{
    var { password, email } = req.body;
    try{
        // get collection reference 
        const collection = await firestore.collection('logins')
        // get document reference 
        const user = await collection.doc(`${email}`)
        // validate document
        const snapshot = await user.get()
        if (snapshot.exists){ // since id is email, this validates email 
            const data = snapshot.data() //read the doc data 

            if (data.contraseña == password){ //validate password 
                var token = jwt.sign({ id: data.id }, SECRET);
                return res.send({
                    error: false,
                    data: {
                        token,
                        email,
                        type: data.tipo
                    }
                });
            }else{
                return res.end({
                    error: true,
                    message: 'Contraseña equivocada'
                });
            }
        }else{
            return res.send({
                error: true,
                message: 'No se encontró el usuario.'
            });
        }
    } catch(err){
        return res.end({
            error: true,
            message: 'Error inesperado.'
        });
    }
}

const verifyToken = (firestore)=>{
    return (req, res, next)=>{
        var token;
        if(req.method=='POST'){
            token = req.body.token;
        }else{
            token = req.query.token;
        }
        
        // No token sent.
        if(!token) return res.send({
            error: true,
            code: 999,
            message: 'Token invalid'
        })
    
        // Verify token
        verify(firestore, token).then(user=>{
            if(user){
                req.user = user;
                return next();
            }else return res.send({
                error: true,
                code: 999,
                message: 'Token invalid'
            });
        });
    }
}

const verify = async (firestore, token)=>{
    try{
        var decoded = jwt.verify(token, SECRET);
        const collection = await firestore.collection('logins')
        const query = await (await collection.where('id', '==', decoded.id)).get();
        if(query.empty) return false;
        var user;
        query.forEach(v=>{
            if(v.data().id==decoded.id) user = v.data();
        });

        return user;
    }catch(err){
        return false;
    }
}

module.exports = {
    authenticate,
    verifyToken
}