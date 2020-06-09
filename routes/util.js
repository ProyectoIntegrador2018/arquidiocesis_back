/** 
 * Module that contains utilities for exporting to csv
 * @module Util 
 */
const Readable = require('stream').Readable;
const iconv = require('iconv-lite')

/**
 * Turns data to CSV
 * @param {Array<String>} header  - contains all the headers for the columns
 * @param {Array<String>} values  - Conains all the values for each row 
 */
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