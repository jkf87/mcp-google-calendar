import { google } from 'googleapis';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getRefreshToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
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
    
    // 디버깅용 전체 토큰 정보 출력
    console.log('\nFull token information:', JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
}

getRefreshToken().catch(console.error);