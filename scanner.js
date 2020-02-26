const { google } = require('googleapis'); //includes the google api
const keys = require('./keys.json');    //super secret file of log in info
const readline = require('readline');

//creates a new client instance to log into the sheet
const client = new google.auth.JWT(
    keys.client_email,  //this is the email that logs into the sheet, (this is a special email that is created from google API center)
    null,               //some field I dont need 
    keys.private_key,   //password stuffs
    ['https://www.googleapis.com/auth/spreadsheets']    //tells the sheet what scopes we need (for this instance this lets us view and edit a sheet)
);

//logs on the client object, gives back an error if something broke
client.authorize(function (err, tokens) {

    if (err) {
        console.log(err);
        return;
    }
    else {
        console.log("Connected");
        gsrun(client);
    }
});

getID();
//will constantly be checking for user input
async function getID() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
     rl.question('Scan Id: ', (id) => {
        // TODO: Log the answer in a database
        let data = await getCAT(id)
        console.log(`Data from ID: `);
    });

    getID();
}

async function getCAT(id) {
    const gsapi = google.sheets({
        version: 'v4',
        auth: client
    });

    //used to pull information from the spreadsheet
    const opt = {
        spreadsheetId: '1nHmFKFvP-Q_Hez33GSMz_wLvznugLqpDKo2fHmMvcvo', //spreadsheet id
        range: 'D2:E100'    //value range that we are pulling from (assuming that we dont have more than 100 CATs on desk)
    };

    let data = await gsapi.spreadsheets.values.get(opt);


    //assigns a new array of data and inserts values from the spreadsheet
    //to it
    let dataArray = data.data.values;

    //parse through the file to find the person who scanned
    dataArray.forEach(element => {
        if (element[1] == id) {
            console.log(element);
            return element;
        }
    });
}

//pulls data from the spreadsheet and then allows us to update back to the sheet
//async because we need it to wait until data is recieved and/or pushed 
async function gsrun(client) {

    //used to create a new array of information that we can put into the 
    //spreadsheet
    /*
    let newDataArray = dataArray.map(function (r) {

    });

    //updates the data to the spreadsheet
    let resp = await gsapi.spreadsheets.values.get(opt);

    //used tp push values to the spreadsheet
    const updateOpt = {
        spreadsheetId: '1nHmFKFvP-Q_Hez33GSMz_wLvznugLqpDKo2fHmMvcvo', //spreadsheet id
        range: 'G2',    //starting index to insert from
        valueInputOption: 'USER_ENTERED',   //how the data is interpreted
        response: { values: newDataArray }    //tells us if it worked or not
    };

    */

    //Need to get date and time for when a cat scanned their barcode
    //this will rely on the system time
    //There will be three fields that will be manipulated here
    //1: clock on timestamp
    //2: clock off timestamp
    //3: total time logged (might round it to nearest hour because we dont need to be that strict)

}