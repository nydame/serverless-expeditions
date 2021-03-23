const { google } = require('googleapis');
const express = require('express');
const app = express();

// const port = process.env.PORT || 8080;
const port = 8089; // testing only
app.listen(port, () => {
  console.log('SlipSlap REST API listening on port', port);
});

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

app.get('/:type', async (req, res) => {
  const type = req.params.type;
  const terms = await getTerms(type);
  const termLen = Object.keys(terms).length;
  let returnVal;
  if ( termLen > 0 && terms.errorMessage === undefined ) {
    returnVal = {status: 'success', data: {terms: terms}};
  }else if (termLen === 0) {
    res.status(403);
    returnVal = {status: 'fail', data: {message: "Request not permitted."}};
  } else {
    res.status(404);
    returnVal = {status: 'fail', data: {message: `${terms.errorMessage}`}};
  }
  res.setHeader('content-type', 'application/json');
  res.send(JSON.stringify(returnVal));
});

async function getTerms(type='Overview') { 
  const terms = {};
  let errorMessage;

  try {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const api = google.sheets({version: 'v4', auth});
    const response = await api.spreadsheets.values.get({
      spreadsheetId: '1NO_TAXaJiM1C-6F9ZdLpAFEnhTRaRzyxl5erc-0RKbc',
      range: `${type}!A:C`,
    });
    for (let row in response.data.values) {
      terms[row[0]] = row[2];
    }
  } catch(error) {
    errorMessage = error.errorMessage;
    console.error(errorMessage);
  }

  return new Promise( (resolve, reject) => {
    if (terms) {resolve(terms);}
    else {reject( {errorMessage} );}
  });
}

