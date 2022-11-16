const fs = require('fs');
const express = require('express');

const chanceOfFailure = 0.10;
const port = 9001;
const shiftList = JSON.parse(fs.readFileSync('shift_list.json', 'utf8'));
const nurseList = JSON.parse(fs.readFileSync('nurse_list.json', 'utf8'));

const app = express();

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to CORS server 😁')
})
app.get('/cors', (req, res) => {
  res.send('This has CORS enabled 🎈')
})

var cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.text());



/**
 * Returns a JSON list of the shifts in the facility
 */
app.get('/shifts', (req, res) => {
  console.info('Attempting to send shift list to requestor');
  if (Math.random() > chanceOfFailure) {
    res.status(200).send(shiftList);
    console.info('Successfully delivered shift list');
  }
  else {
    res.status(500).send({ error: 'Server blew up' });
    console.error('Oh no! The send failed!');
  }
});

/**
 * Returns a JSON list of nurses in the facility
 */
app.get('/nurses', (req, res) => {
  console.info('Attempting to send nurse list to requestor');
  if (Math.random() > chanceOfFailure) {
    res.status(200).send(nurseList);
    console.info('Successfully delivered nurse list');
  }
  else {
    res.status(500).send({ error: 'Server blew up' });
    console.error('Oh no! The send failed!');
  }
});

/*
 * Given an API call with a shift ID to save and a nurseID in the request body, will fake saving that nurse to the shift.
 */
app.put('/shifts/:shiftID/:nurseID', (req, res) => {
  const shiftID = req.params.shiftID;
  const nurseID = req.params.nurseID;
  // const nurseID = req.body.nurseID;

  console.info(`Attempting to save shift ${shiftID} with nurse ${nurseID} assigned to it.`);
  if (Math.random() > chanceOfFailure) {
    res.status(200).send({
      shiftID,
      nurseID,
    });

    // Update shift data with selected nurse ID
    const shift = shiftList.find(s => s.id === parseInt(shiftID));
    if (shift) {
      shift.nurse_id = parseInt(nurseID);
    }

    // Write new data to file
    const json = JSON.stringify(shiftList);
    fs.writeFile('shift_list.json', json, 'utf8', () => {
      console.info(`Successfully saved the shift ${shiftID}`)
    });
  }

  else {
    res.status(500).send({ error: 'Server blew up' });
    console.error('Oh no! The save failed!');
  }
});


/**
 * Start the server
 */
app.listen(port, () => {
  console.info(`Server is listening on port ${port}`);
});
