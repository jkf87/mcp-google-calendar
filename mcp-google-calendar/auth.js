@"
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getRefreshToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost'
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  console.log('After authorization, copy the code from the redirect URL');
  
  // Wait for user input
  const code = await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.on('data', data => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nYour refresh token:', tokens.refresh_token);
    console.log('\nUpdate this token in your index.js file in the createCalendarEvent function');
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
}

getRefreshToken().catch(console.error);
"@ | Out-File -FilePath "auth.js" -Encoding utf8