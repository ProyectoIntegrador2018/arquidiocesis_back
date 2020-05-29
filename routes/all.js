const csvjson = require('csvjson');

const getAcompanantes = async (firestore, req, res)=>{
    const acompanantes_snap = await firestore.collection('acompanantes').get()
    acompanantes = acompanantes_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(acompanantes)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}

const getAdmins = async (firestore, req, res)=>{
    const admins_snap = await firestore.collection('admins').get() 
    admins = admins_snap.docs.map(doc =>{return  { id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(admins)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getCapacitaciones = async (firestore, req, res)=>{
    const capacitaciones_snap = await firestore.collection('capacitaciones').get() 
    capacitaciones = capacitaciones_snap.docs.map(doc =>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(capacitaciones)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}

const getCapillas = async (firestore, req, res)=>{
    const capillas_snap = await firestore.collection('capillas').get()
    capillas = capillas_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(capillas)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getCoordinadores = async (firestore, req, res)=>{
    const coordinadores_snap = await firestore.collection('coordinadores').get()
    coordinadores = coordinadores_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(coordinadores)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getDecanatos = async (firestore, req, res)=>{
    const decanatos_snap = await firestore.collection('decanatos').get()
    decanatos = decanatos_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(decanatos)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}

const getGrupos = async(firestore, req, res)=>{
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
    const grupos = []
    for(let n = 0; n<grupos_asistencias.length; n++){
        const asistencias = grupos_asistencias[n].docs.map(doc =>{return {id: doc.id, ...doc.data()}})
        grupos.push({
            ...group_general_data[n],
            ...asistencias
        })
    }
    const stringy = JSON.stringify(grupos)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getLogins = async(firestore, req, res)=>{
    const logins_snap = await firestore.collection('logins').get()
    logins = logins_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(logins)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getMiembros = async(firestore, req, res)=>{
    const miembros_snap = await firestore.collection('miembros').get()
    miembros = miembros_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(miembros)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getParroquias = async(firestore, req, res)=>{
    const parroquias_snap = await firestore.collection('parroquias').get()
    parroquias = parroquias_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(parroquias)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}
const getParticipantes = async(firestore, req, res)=>{
    const participantes_snap = await firestore.collection('participantes').get()
    participantes = participantes_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(participantes)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}

const getZonas = async(firestore, req, res)=>{
    const zonas_snap = await firestore.collection('zonas').get()
    zonas = zonas_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(zonas)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: csvData
    })
}

const getall = async (firestore, req, res)=>{
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


    const stringy = JSON.stringify(monolito)
    const csvData = csvjson.toCSV(stringy, { headers: 'key' })

    res.send({
        error: false, 
        data: csvData
    })
}

module.exports = {
    getAcompanantes, 
    getAdmins,
    getCapacitaciones,
    getCapillas,
    getCoordinadores, 
    getDecanatos, 
    getGrupos, 
    getLogins, 
    getMiembros, 
    getParroquias, 
    getParticipantes,
    getZonas,
    getall
}