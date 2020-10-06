/**
 * Module for managing 'All modules'
 * @module All
 */
const csvjson = require('csvjson');
const moment = require('moment');
const Readable = require('stream').Readable;
const iconv = require('iconv-lite')
const util = require('./util');

/**
 * /
 * Converts an string to stream to send it in a file.
 */
function stringToStream(str){
	var stream = new Readable;
	stream.setEncoding('UTF8');
	stream.push(Buffer.from(str, 'utf8'));
	stream.push(null);
	return stream.pipe(iconv.encodeStream('utf16le'));
}

/**
 * /
 * Convert a JSON object to headers and values for XLS generation.
 */
function convertJson(obj){
    if(obj.length==0) return { headers: [], values: [] };
    var headers = Object.keys(util.flattenObject(obj[0]));
    var values = [];

    for(var i of obj){
        var val = []
        var flat = util.flattenObject(i)
        for (var h of headers){
            val.push(flat[h]);
        }
        values.push(val);
    }

    return { headers, values };
}

/**
 * /
 * Gets all data in the acompañantes collection
 */
const getAcompanantes = async (firestore, req, res)=>{
    const acompanantes_snap = await firestore.collection('acompanantes').get()
    var acompanantes = acompanantes_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})
    acompanantes.forEach(a=>{
        if(a.fecha_nacimiento && a.fecha_nacimiento._seconds){
            a.fecha_nacimiento = moment.unix(a.fecha_nacimiento._seconds).format('YYYY-MM-DD');
        }
    })
    
    var { headers, values } = convertJson(acompanantes);
    const xls = util.toXLS(headers, values);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Acompanantes.xls')
    return xls.pipe(res);
}

/**
 * /
 * Gets all data in the Admins collection
 */
const getAdmins = async (firestore, req, res)=>{
    const admins_snap = await firestore.collection('admins').get() 
    var admins = admins_snap.docs.map(doc =>{return  { id: doc.id, ...doc.data()}})
    
    var { headers, values } = convertJson(admins);
    const xls = util.toXLS(headers, values);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Admins.xls')
    return xls.pipe(res);
}

/**
 * /
 * Gets all data in the capacitations collection
 */
const getCapacitaciones = async (firestore, req, res)=>{
    const capacitaciones_snap = await firestore.collection('capacitaciones').get() 
    var capacitaciones = capacitaciones_snap.docs.map(doc =>{return {id: doc.id, ...doc.data()}})
    capacitaciones.forEach(a=>{
        if(a.inicio && a.inicio._seconds){
            a.inicio = moment.unix(a.inicio._seconds).format('YYYY-MM-DD');
        }
        if(a.fin && a.fin._seconds){
            a.fin = moment.unix(a.fin._seconds).format('YYYY-MM-DD');
        }
        if(a.creacion && a.creacion._seconds){
            a.creacion = moment.unix(a.creacion._seconds).format('YYYY-MM-DD');
        }
    })
    var { headers, values } = convertJson(capacitaciones);
    const xls = util.toXLS(headers, values);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Capacitaciones.xls')
    return xls.pipe(res);
}

/**
 * /
 * Gets all data in the capillas collection
 */
const getCapillas = async (firestore, req, res)=>{
    const capillas_snap = await firestore.collection('capillas').get()
    var capillas = capillas_snap.docs.map(doc => {return {id: doc.id, ...doc.data()}})
   
    var { headers, values } = convertJson(capillas);
    const xls = util.toXLS(headers, values);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Capillas.xls')
    return xls.pipe(res);
}

/**
 * /
 * Gets all data in the coordinadores collection
 */
const getCoordinadores = async (firestore, req, res)=>{
    const coordinadores_snap = await firestore.collection('coordinadores').get()
    const coordinadores = coordinadores_snap.docs.map(doc => {
        return {
            id: doc.data().identificador || doc.id,
            ...doc.data()
        }
    })
    
    coordinadores.forEach(a=>{
        if(a.fecha_nacimiento && a.fecha_nacimiento._seconds){
            a.fecha_nacimiento = moment.unix(a.fecha_nacimiento._seconds).format('YYYY-MM-DD');
        }
    })
    var { headers, values } = convertJson(coordinadores);
    const xls = util.toXLS(headers, values);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Coordinadores.xls')
    return xls.pipe(res);
}

/**
 * /
 * Gets all data in the decanatos collection
 */
const getDecanatos = async (firestore, req, res)=>{
    const decanatos_snap = await firestore.collection('decanatos').get()
    var decanatos = decanatos_snap.docs.map(doc=>{
        var d = doc.data();
        var acom_ref = d.acompanante;
        var acompanante = { 
            sexo: '',
            fecha_nacimiento: '',
            escolaridad: '',
            email: '',
            domicilio:
                { 
                    telefono_casa: '',
                    colonia: '',
                    municipio: '',
                    domicilio: '',
                    telefono_movil: '' 
                },
            oficio: '',
            estado_civil: '' 
        }
        return firestore.collection('zonas').doc(d.zona).get().then(zona_snap => {
            var nombre_zona = zona_snap.data().nombre
            if (acom_ref) {
                return firestore.collection('acompanantes').doc(acom_ref).get().then(acom_snap => {
                    acompanante = acom_snap.data()
                    if(acompanante.fecha_nacimiento && acompanante.fecha_nacimiento._seconds){
                        acompanante.fecha_nacimiento = moment.unix(acompanante.fecha_nacimiento._seconds).format('YYYY-MM-DD');
                    }
                    var { nombre, apellido_paterno, apellido_materno } = acompanante
                    return{ id: doc.id, decanato: d.nombre, zona: nombre_zona, nombre_acom: nombre, ap_pat: apellido_paterno, ap_mat: apellido_materno, ...acompanante }
                })
            } else {
                return{ id: doc.id, decanato: d.nombre, zona: nombre_zona, nombre_acom: '', ap_pat: '', ap_mat: '', ...acompanante }
            }
        })
    })

    Promise.all(decanatos).then(decanatos_done => {
        var { values } = convertJson(decanatos_done);
        var headers = ['ID Decanato', 'Nombre de Decanato', 'Zona', 'Nombre de Acompañante', 'Apellido Paterno', 'Apellido Materno', 'Sexo', 'Fecha Nacimiento', 'Escolaridad', 'Correo electrónico', 'Teléfono de Casa', 'Colonia', 'Municipio', 'Domicilio', 'Teléfono Móvil', 'Oficio', 'Estado Civil'];
        const xls = util.toXLS(headers, values);

        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.attachment('Decanatos.xls')
        return xls.pipe(res);
    })
}

/**
 * /
 * Gets all data in the groups collection
 */
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
    const xls = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: xls
    })
}

/**
 * /
 * Gets all data in the logins collection
 */
const getLogins = async(firestore, req, res)=>{
    const logins_snap = await firestore.collection('logins').get()
    logins = logins_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(logins)
    const xls = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: xls
    })
}

/**
 * /
 * Gets all data in the miembros collection
 */
const getMiembros = async(firestore, req, res)=>{
    const miembros_snap = await firestore.collection('miembros').get()
    miembros = miembros_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(miembros)
    const xls = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: xls
    })
}

/**
 * /
 * Gets all data in the parroquias collection
 */
const getParroquias = async(firestore, req, res)=>{
    const parroquias_snap = await firestore.collection('parroquias').get()
    parroquias = parroquias_snap.docs.map(doc=>{return{id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(parroquias)
    const xls = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: xls
    })
}

/**
 * /
 * Gets all data in the participantes collection
 */
const getParticipantes = async(firestore, req, res)=>{
    const participantes_snap = await firestore.collection('participantes').get()
    participantes = participantes_snap.docs.map(doc=>{return {id: doc.id, ...doc.data()}})
    const stringy = JSON.stringify(participantes)
    const xls = csvjson.toCSV(stringy, { headers: 'key' })
    res.send({
        error: false, 
        data: xls
    })
}

/**
 * /
 * Gets all data in the zones collection
 */
const getZonas = async(firestore, req, res)=>{
    const zonas_snap = await firestore.collection('zonas').get()
    var zonas = zonas_snap.docs.map(doc=>{
        var d = doc.data();
        var acom_ref = d.acompanante;
        var acompanante = { 
            sexo: '',
            fecha_nacimiento: '',
            escolaridad: '',
            email: '',
            domicilio:
                { 
                    telefono_casa: '',
                    colonia: '',
                    municipio: '',
                    domicilio: '',
                    telefono_movil: '' 
                },
            oficio: '',
            estado_civil: '' 
        }
        if (acom_ref) {
            return firestore.collection('acompanantes').doc(acom_ref).get().then(acom_snap => {
                acompanante = acom_snap.data()
                if(acompanante.fecha_nacimiento && acompanante.fecha_nacimiento._seconds){
                    acompanante.fecha_nacimiento = moment.unix(acompanante.fecha_nacimiento._seconds).format('YYYY-MM-DD');
                }
                var { nombre, apellido_paterno, apellido_materno } = acompanante
                return{ id: doc.id, nombre_zona: d.nombre, nombre_acom: nombre, ap_pat: apellido_paterno, ap_mat: apellido_materno, ...acompanante }
            })
        } else {
            return{ id: doc.id, nombre_zona: d.nombre, nombre_acom: '', ap_pat: '', ap_mat: '', ...acompanante }
        }
    })

    Promise.all(zonas).then(zonas_done => {
        var { values } = convertJson(zonas_done);
        var headers = ['ID Zona', 'Nombre de Zona', 'Nombre de Acompañante', 'Apellido Paterno', 'Apellido Materno', 'Sexo', 'Fecha Nacimiento', 'Escolaridad', 'Correo electrónico', 'Teléfono de Casa', 'Colonia', 'Municipio', 'Domicilio', 'Teléfono Móvil', 'Oficio', 'Estado Civil'];
        const xls = util.toXLS(headers, values);

        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.attachment('Zonas.xls')
        return xls.pipe(res);
    })
}

/**
 * /
 * Gets data from all the collections
 */
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
    const xls = csvjson.toCSV(stringy, { headers: 'key' })

    res.send({
        error: false, 
        data: xls
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