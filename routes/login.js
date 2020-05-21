const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const SECRET = 'R?<=2vYPXm)n*_kd,Hp.W2GG[hD3b2D/';

const authenticate = async (firestore, req, res)=>{
	 var { password, email } = req.body;
    try{
        // get collection reference 
        const collection = await firestore.collection('logins')
        // get document reference 
		  const user = await collection.doc(`${email.toLowerCase()}`)
        // validate document
		  const snapshot = await user.get()
        if (snapshot.exists){ // since id is email, this validates email 
				const data = snapshot.data() //read the doc data 

            if (bcrypt.compareSync(password, data.password)){ //validate password 
                var token = jwt.sign({ id: data.id }, SECRET);
                return res.send({
                    error: false,
                    data: {
                        token,
                        email: email.toLowerCase(),
                        type: data.tipo
                    }
                });
            }else{
                return res.send({
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
        return res.send({
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
                req.user.admin = user.tipo=='admin' || user.tipo=='superadmin';
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
        var user = { ...query.docs[0].data(), email: query.docs[0].id };
        return user;
    }catch(err){
        return false;
    }
}

const changePassword = async (firestore, req, res)=>{
	var { old_password, new_password } = req.body;
	if(new_password.length<5) return res.send({
		error: true,
		message: 'La nueva contraseña debe de ser de minimo 5 caracteres.'
	})
	try{
		const userSnap = await firestore.collection('logins').where('id', '==', req.user.id).get();
		if(userSnap.size==0) return res.send({
			error: true,
			message: 'No existe un usuario con ese id.'
		});
		var login = userSnap.docs[0].data();
		login.email = userSnap.docs[0].id;
		if(!bcrypt.compareSync(old_password, login.password)){
			return res.send({
				error: true,
				code: 923, // Arbitrary number
				message: 'La contraseña actual es incorrecta.'
			});
		}
		var passwordHash = bcrypt.hashSync(new_password);
		await firestore.collection('logins').doc(login.email).update({ password: passwordHash });

		return res.send({
			error: false,
			message: 'Se ha cambiado la contraseña.'
		})
	}catch(e){
		return res.send({
			error: true,
			message: 'Error inesperado.'
		})
	}

}

module.exports = {
    authenticate,
	verifyToken,
	changePassword
}