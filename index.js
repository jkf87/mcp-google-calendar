#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from 'googleapis';

// Debug log utility
function debugLog(...args) {
    console.error('DEBUG:', new Date().toISOString(), ...args);
}

// Define the create_event tool
const CREATE_EVENT_TOOL = {
    name: "create_event",
    description: "Create a calendar event with specified details",
    inputSchema: {
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "Event title"
            },
            start_time: {
                type: "string",
                description: "Start time (ISO format)"
            },
            end_time: {
                type: "string",
                description: "End time (ISO format)"
            },
            description: {
                type: "string",
                description: "Event description"
            },
            attendees: {
                type: "array",
                items: { type: "string" },
                description: "List of attendee emails"
            }
        },
        required: ["summary", "start_time", "end_time"]
    }
};

// Server implementation
const server = new Server({
    name: "mcp_calendar",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});

debugLog('Server initialized');

// Check for required environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required");
    process.exit(1);
}

// Calendar event creation function
async function createCalendarEvent(args) {
    debugLog('Creating calendar event with args:', JSON.stringify(args, null, 2));
    
    try {
        debugLog('Creating OAuth2 client');
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            'http://localhost'
        );
        debugLog('OAuth2 client created');
        
        debugLog('Setting credentials');
        // Replace this with your refresh token obtained from auth.js
        oauth2Client.setCredentials({
            refresh_token: "YOUR_REFRESH_TOKEN",
            token_uri: "https://oauth2.googleapis.com/token"
        });
        debugLog('Credentials set');

        debugLog('Creating calendar service');
        const calendar = google.calendar({ 
            version: 'v3',
            auth: oauth2Client
        });
        debugLog('Calendar service created');
        
        const event = {
            summary: args.summary,
            description: args.description,
            start: {
                dateTime: args.start_time,
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: args.end_time,
                timeZone: 'America/New_York',
            }
        };
        debugLog('Event object created:', JSON.stringify(event, null, 2));

        if (args.attendees) {
            event.attendees = args.attendees.map(email => ({ email }));
            debugLog('Attendees added:', event.attendees);
        }

        debugLog('Attempting to insert event');
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        debugLog('Event insert response:', JSON.stringify(response.data, null, 2));
        return `Event created: ${response.data.htmlLink}`;
    } catch (error) {
        debugLog('ERROR OCCURRED:');
        debugLog('Error name:', error.name);
        debugLog('Error message:', error.message);
        debugLog('Error stack:', error.stack);
        throw new Error(`Failed to create event: ${error.message}`);
    }
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    debugLog('List tools request received');
    return { tools: [CREATE_EVENT_TOOL] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    debugLog('Call tool request received:', JSON.stringify(request, null, 2));
    
    try {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }

        switch (name) {
            case "create_event": {
                debugLog('Handling create_event request');
                const result = await createCalendarEvent(args);
                debugLog('Event creation successful:', result);
                return {
                    content: [{ type: "text", text: result }],
                    isError: false,
                };
            }
            default:
                debugLog('Unknown tool requested:', name);
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    } catch (error) {
        debugLog('Error in call tool handler:', error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});

// Server startup function
async function runServer() {
    debugLog('Starting server');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    debugLog('Server connected to transport');
    console.error("Calendar MCP Server running on stdio");
}

// Start the server
runServer().catch((error) => {
    debugLog('Fatal server error:', error);
    console.error("Fatal error running server:", error);
    process.exit(1);
});