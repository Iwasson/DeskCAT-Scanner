const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');




async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet('1zdoVuwPLczdKhyEow59TgS6W4SYognvD_o8aUcJAx_E');
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[0];
    const rows = await promisify(sheet.getRows)({
    });


    console.log(rows);
    //console.log('Title: ' + sheet.title + ' Rows: ' + sheet.rowCount);


}

accessSpreadsheet();