# MCP Google Calendar Server 
 
A Model Context Protocol (MCP) server implementation that enables AI assistants like Claude to create and manage Google Calendar events. 
 
## Features 
 
- Create calendar events with title, description, start/end times 
- Support for adding event attendees 
- OAuth2 authentication with Google Calendar API 
- Full MCP protocol implementation 
- Debug logging for troubleshooting 
 
## Prerequisites 
 
- Node.js v18 or later 
- Google Cloud Console project with Calendar API enabled 
- OAuth2 credentials (Client ID and Client Secret) 
 
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
 
3. Set up environment variables: 
- Copy .env.example to .env 
- Add your Google OAuth2 credentials 
 
4. Get your refresh token: 
```bash 
npm run auth 
``` 
 
5. Update the refresh token in index.js 
 
## Usage 
 
```bash 
npm start 
``` 
