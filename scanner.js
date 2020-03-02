const { google } = require('googleapis'); //includes the google api
const keys = require('./keys.json');    //super secret file of log in info

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }


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
        getID(client);
    }
});


//will constantly be checking for user input
async function getID() {
    
    var stdin = process.openStdin();
    console.log("Please Scan your ID...");
    //will collect user input and then process the input
    stdin.addListener("data", function (d) {
        console.log("you entered: " + d.toString().trim());
        processInput(d.toString().trim());
    });
}

//returns the position of the row that the cat was found at
//also gets a time stamp for the search, this will be used to process clock on and off
async function processInput(d) {
    var date = new Date();
    var pos = 0;

    pos = await getCAT(d.toString().trim());
    var ts = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + ":" + date.getHours()
    console.log("TimeStamp: " + ts);
    //console.log(pos);

    updateCAT(pos);

}


//returns the row number that CAT is located on
async function getCAT(id) {
    const gsapi = google.sheets({
        version: 'v4',
        auth: client
    });

    //used to pull information from the spreadsheet
    const opt = {
        spreadsheetId: '1nHmFKFvP-Q_Hez33GSMz_wLvznugLqpDKo2fHmMvcvo', //spreadsheet id
        range: 'A2:B100'    //value range that we are pulling from (assuming that we dont have more than 100 CATs on desk)
    };

    let data = await gsapi.spreadsheets.values.get(opt);


    //assigns a new array of data and inserts values from the spreadsheet
    //to it
    let dataArray = data.data.values;
    let found = false;

    //parse through the file to find the person who scanned
    var pos = 2;
    dataArray.forEach(element => {
        if (element[1] == id) {
            console.log(element);
            found = true;
        }
        if (found == false) { pos += 1; }
    });
    if (found == false) { console.log("Could not find CAT"); }

    return pos;
}

//takes the row position and the time stamp
//will append the timestamp to the correct date row
async function updateCAT(pos) {
    //The google spreadsheet has script that I wrote to auto shift 
    //cells every day and label them accordingly. 
    //Notify me on Rocket if something bad happens!

    //need to check and see if the CAT has clocked on
    //if the cat has not clocked on (the first cell is blank)
    //then add the timestamp as the clock on time
    //  Column    Expected Values
    //  D         Date mm/dd/yyyy
    //  E         Clock on time 24h
    //  F         Clock off time 24h
    //  G         Hours, difference between E and F
    var date = new Date();

    var fullDate = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
    var hour = date.getHours();
    var clockOn = true;
    var newRange = 'catids!D' + pos;

    const gsapi = google.sheets({
        version: 'v4',
        auth: client
    });

    //used to pull information from the spreadsheet
    const opt = {
        spreadsheetId: '1nHmFKFvP-Q_Hez33GSMz_wLvznugLqpDKo2fHmMvcvo', //spreadsheet id
        range: 'E2:E100'    //value range we are looking at, we need to check E2:E100 to see if there is a clock on time
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    dataArray = data.data.values;

    if(dataArray[pos-2] == undefined || dataArray[pos-2] == 0)
    {
        clockOn = false;
    }

    if(clockOn == false) {
        console.log("Clocking You on!");
        
        vals = {
            "range": "catids!D" + pos,
            "majorDimension": "ROWS",
            "values": [
                [fullDate, hour, null, null],
            ],
        };
    }
    else {
        console.log("Clocking You off!");
        vals = {
            "range": "catids!D" + pos,
            "majorDimension": "ROWS",
            "values": [
                [fullDate, null, hour, null],
            ],
        };
    }
    

    const updateOptions = {
        spreadsheetId: '1nHmFKFvP-Q_Hez33GSMz_wLvznugLqpDKo2fHmMvcvo',
        range: newRange,
        valueInputOption: 'USER_ENTERED',
        resource: vals,
    };



    let res = await gsapi.spreadsheets.values.update(updateOptions);

    console.log("Thank you for scanning your ID!");
    sleep(5000);
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
    console.log("Please Scan your ID...");
}