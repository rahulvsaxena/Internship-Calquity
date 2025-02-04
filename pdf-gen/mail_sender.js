import fs, { promises as fspromise } from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/ediscovery'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fspromise.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fspromise.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fspromise.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Create the raw message with attachment.
 *
 * @param {string} to The recipient email address.
 * @param {string} from The sender email address.
 * @param {string} subject The email subject.
 * @param {string} message The email body.
 * @param {string} filePath The file path to the PDF attachment.
 * @returns {string} The base64url encoded raw message.
 */
function makeBodyWithAttachment(to, from, subject, message, filePath, fileNameToAttach) {
  const boundary = 'boundary-cqnow';
  const attachmentData = fs.readFileSync(filePath).toString('base64');

  const messageParts = [
    `From: CQNow <${from}>`,
    `To: ${to}`,
    'Content-Type: multipart/mixed; boundary=' + boundary,
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    message,
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${fileNameToAttach}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${fileNameToAttach}"`,
    '',
    attachmentData,
    '',
    `--${boundary}--`,
  ];

  const messageNew = messageParts.join('\n');
  const encodedMessage = Buffer.from(messageNew)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
}

/**
 * Send an email message with an attachment.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} to The recipient email address.
 * @param {string} subject The email subject.
 * @param {string} body The body of the email.
 * @param {string} filePath The file path to the PDF attachment.
 */
async function sendMail(auth, to, subject, body, filePath, fileNameToAttach) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.send({
    auth: auth,
    userId: 'me',
    resource: {
      raw: makeBodyWithAttachment(to, process.env.EMAIL_SENDER, subject, body, filePath, fileNameToAttach),
    },
  });
  console.log('Message Id: %s', res.data.id);
}


/**
 * Exported function to send an email.
 *
 * @param {string} to The recipient email address.
 * @param {string} subject The email subject.
 * @param {string} message_body The body of the email.
 */
export async function sendEmail(to, subject, message_body, pdfPath, fileNameToAttach) {
  const auth = await authorize();
  if (!auth) {
    console.error('No credentials found. Exiting.');
    return;
  }
  await sendMail(auth, to, subject, message_body, pdfPath, fileNameToAttach);
}