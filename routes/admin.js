const isAdmin = (req, res, next)=>{
	if(req.user.tipo=='admin') return next();
	else return res.send({
		error: true,
		message: 'Usuario no es administrador.'
	})
}

const getLogins = async (firestore, req, res)=>{
	const loginSnap = await firestore.collection('logins').where('tipo', 'in', ['admin', 'coordinador_general']).get();
	var logins = loginSnap.docs.map(a=>({ email: a.id, member_id: a.data().id, tipo: a.data().tipo }));
	return res.send({
		error: false,
		data: logins,
	})
}

module.exports = {
	isAdmin,
	getLogins
}