# MCP Google Calendar Server 
 
A Model Context Protocol (MCP) server implementation that enables AI assistants like Claude to create and manage Google Calendar events. 
 
## Features 
 
- Create calendar events with title, description, start/end times 
- Support for adding event attendees 
- OAuth2 authentication with Google Calendar API using Firebase 
- Full MCP protocol implementation 
- Debug logging for troubleshooting 
 
## Prerequisites 
 
- Node.js v18 or later 
- Firebase project
- Google Calendar API enabled in your Firebase project
 
## Setup 
 
1. Clone the repository: 
```bash 
git clone [https://github.com/markelaugust74/mcp-google-calendar.git] 
cd mcp-google-calendar 
``` 
 
2. Install dependencies: 
```bash 
npm install 
``` 
 
3. Create a Firebase project and configure OAuth:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and create a new project
   - Once your project is created, click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
   - Navigate to the "Service accounts" tab
   - Under "Firebase Admin SDK", click "Generate new private key" to download your service account credentials
   - Save this JSON file securely, you'll need it for authentication

4. Enable Google Calendar API in your Firebase project:
   - In Firebase Console, go to "Build" > "Authentication" > "Sign-in method"
   - Enable "Google" as a sign-in provider
   - Go to [Google Cloud Console](https://console.cloud.google.com/) and select your Firebase project
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it

5. Set up environment variables:
   - Copy .env.example to .env
   - Add the path to your Firebase service account JSON file:
     ```
     FIREBASE_SERVICE_ACCOUNT_PATH=./path-to-your-credentials.json
     ```

6. Get your OAuth2 tokens:
```bash 
npm run auth 
``` 
   - Follow the instructions in the terminal to authenticate with your Google account
   - This will generate the necessary tokens for Google Calendar access

7. The auth process will automatically update the configuration with your refresh token
 
## Usage 
 
```bash 
npm start 
``` 

## Troubleshooting

If you encounter authentication issues:
- Make sure your Firebase project has Google Calendar API enabled
- Verify that you've followed the OAuth consent screen setup correctly
- Check that your service account has the necessary permissions for Google Calendar API
