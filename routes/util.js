const Readable = require('stream').Readable;
const iconv = require('iconv-lite')

function toCSV(header, values){
	var csv = header.join(',')+'\n'+values.map(a=>a.map(a=>{
		if(typeof a === 'string'){
			return '"' + a + '"';
		}else return a;
	}).join(',')).join('\n');
	var stream = new Readable;
	stream.setEncoding('UTF8');
	stream.push(Buffer.from(csv, 'utf8'));
	stream.push(null);

	return stream.pipe(iconv.encodeStream('utf16le'));
}

module.exports = {
	toCSV
}