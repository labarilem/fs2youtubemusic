var fs = require('fs-extra');
var path = require('path');
const readline = require('readline-sync');
var os = require('os');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = path.resolve(path.join(os.homedir(), 'credentials'));
var TOKEN_PATH = path.join(TOKEN_DIR, 'fs2youtubemusic.json');

/**
 * Loads the client secret file and then runs cb passing the client secret file's JSON content.
 */
function loadClientSecret() {
  try {
    const content = fs.readFileSync('client_secret.json');
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Error loading client secret file: ' + err)
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 */
async function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  try {
    // Check if we have previously stored a token.
    const token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);
    return oauth2Client;
  } catch (err) {
    return await getNewToken(oauth2Client);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
async function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url: ', authUrl);

  const code = readline.question('Enter the code from that page here: ');
  let token = null;
  try {
    token = await oauth2Client.getToken(code);
  } catch (err) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
  }

  oauth2Client.credentials = token.tokens;
  storeToken(token.tokens);
  return oauth2Client;
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

exports.loadClientSecret = loadClientSecret;
exports.authorize = authorize;
