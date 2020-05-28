const csvjson = require('csvjson');
const readFile = require('fs').readFile;
const writeFile = require('fs').writeFile;

const exportData = (content)=>{
    const stringy = JSON.stringify(content)
    writeFile('dump.json', stringy, 'utf-8', err =>{ if (err) console.log(err) })
    readFile('dump.json', 'utf-8', (err, fileContent) => {
        if (err) {
            console.log(err); // Do something to handle the error or just throw it
        }

        const csvData = csvjson.toCSV(fileContent, {
            headers: 'key'
        })

        writeFile('dump.csv', csvData, (err) => {
            if(err) {
                console.log(err) // Do something to handle the error or just throw it
            }
            console.log('Success!')
        })
    })
}

module.exports = {
    exportData
}