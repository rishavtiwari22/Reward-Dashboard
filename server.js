const { google } = require('googleapis');

// Function to write data into the Google Sheet
async function writedata() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Added correct scopes
  });

  const client = await auth.getClient();
  const spreadsheetId = '1IodvGV6DhMuhcp9enRTynJlA3NYFjV677FBYBTl4nSA';

  const googleSheetsIntegration = google.sheets({ version: 'v4', auth: client });

  try {
    await googleSheetsIntegration.spreadsheets.values.update({
      spreadsheetId, 
      range: 'Sheet1!A:F',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['Campus', 'Date', 'House', 'Point', 'Rewards', 'Amount'],
          ['Jashpur', '2021-10-01', 'Bhairav', 10, 1, 100],
          ['Raipur', '2021-10-02', 'Malhar', 15, 1.5, 150],
        ],
      },
    });
    console.log('Data written successfully');
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

writedata();
