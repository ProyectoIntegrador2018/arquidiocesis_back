const readfile = require('./readfile')

const get = async (firestore, req, res)=>{
    const monolito = {}
    const acompanantes_snap = await firestore.collection('acompanantes').get()
    monolito.acompanantes = acompanantes_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})

    const admins_snap = await firestore.collection('admins').get() 
    monolito.admins = admins_snap.docs.map(doc =>{return  { id: doc.id, ...doc.data()}})

    const capacitaciones_snap = await firestore.collection('capacitaciones').get() 
    monolito.capacitaciones = capacitaciones_snap.docs.map(doc =>{return {id: doc.id, ...doc.data()}})

    const capillas_snap = await firestore.collection('capillas').get()
    monolito.capillas = capillas_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})

    const coordinadores_snap = await firestore.collection('coordinadores').get()
    monolito.coordinadores = coordinadores_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})

    const decanatos_snap = await firestore.collection('decanatos').get()
    monolito.decanatos = decanatos_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})

    //######################## grupos stuff #########################/// 
    const grupos_ids = [] 
    const grupos_snap = await firestore.collection('grupos').get() 
    const group_general_data = grupos_snap.docs.map(doc=>{
        grupos_ids.push(doc.id)
        return {id: doc.id, ...doc.data()}
    })
    const grupos_promises = [] 
    for (id of grupos_ids){
        grupos_promises.push(firestore.collection('grupos').doc(id).collection('asistencias').get())
    }

    const grupos_asistencias = await Promise.all(grupos_promises)
    monolito.grupos = []
    for(let n = 0; n<grupos_asistencias.length; n++){
        const asistencias = grupos_asistencias[n].docs.map(doc =>{return {id: doc.id, ...doc.data()}})
        monolito.grupos.push({
            ...group_general_data[n],
            ...asistencias
        })
    }

    /// ############################################################# /// 

    const logins_snap = await firestore.collection('logins').get()
    monolito.logins = logins_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})

    const miembros_snap = await firestore.collection('miembros').get()
    monolito.miembros = miembros_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})

    const parroquias_snap = await firestore.collection('parroquias').get()
    monolito.parroquias = parroquias_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})

    const participantes_snap = await firestore.collection('participantes').get()
    monolito.participantes = participantes_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})

    const zonas_snap = await firestore.collection('zonas').get()
    monolito.zonas = zonas_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})

    console.log(monolito)
    readfile.exportData(monolito)

    res.send({
        error: false, 
        data: {...monolito}
    })
}

module.exports = {get: get}