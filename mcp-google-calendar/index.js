#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"; // MCP 서버 SDK
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"; // MCP Stdio Transport
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"; // MCP 요청 스키마
import { google } from 'googleapis'; // Google API 라이브러리
import * as dotenv from 'dotenv'; // 환경 변수 로드

// .env 파일에서 환경 변수 로드
dotenv.config();

// 디버그 로그 유틸리티 함수
function debugLog(...args) {
    console.error('DEBUG:', new Date().toISOString(), ...args);
}

// create_event 도구의 스키마 및 메타데이터 정의
const CREATE_EVENT_TOOL = {
    name: "create_event", // 도구 이름
    description: "지정된 세부 정보로 캘린더 이벤트를 생성합니다.", // 도구 설명
    inputSchema: { // 도구의 입력 스키마
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "이벤트 제목"
            },
            start_time: {
                type: "string",
                description: "시작 시간 (ISO 형식)"
            },
            end_time: {
                type: "string",
                description: "종료 시간 (ISO 형식)"
            },
            description: {
                type: "string",
                description: "이벤트 설명"
            },
            attendees: {
                type: "array",
                items: { type: "string" },
                description: "참석자 이메일 목록"
            }
        },
        required: ["summary", "start_time", "end_time"] // 필수 필드
    }
};

// MCP SDK를 사용한 서버 구현
const server = new Server({
    name: "mcp_calendar", // 서버 이름
    version: "1.0.0", // 서버 버전
}, {
    capabilities: {
        tools: {}, // 사용 가능한 도구를 여기에 정의
    },
});

debugLog('서버 초기화됨');

// process.env에서 환경 변수 가져오기
const CLIENT_ID = process.env.CLIENT_ID; // Google Client ID
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Google Client Secret
const REDIRECT_URI = process.env.REDIRECT_URI; // Google Redirect URI

// 필수 환경 변수가 설정되었는지 확인
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("오류: CLIENT_ID 및 CLIENT_SECRET 환경 변수가 필요합니다.");
    process.exit(1); // 설정되지 않은 경우 종료
}

// Google Calendar API를 사용하여 캘린더 이벤트 생성 함수
async function createCalendarEvent(args) {
    debugLog('다음 인수로 캘린더 이벤트 생성 중:', JSON.stringify(args, null, 2));
    
    try {
        debugLog('OAuth2 클라이언트 생성 중');
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );
        debugLog('OAuth2 클라이언트 생성됨');
        
        debugLog('인증 정보 설정 중');
        // 리프레시 토큰을 사용하여 인증
        oauth2Client.setCredentials({
            refresh_token: "1//0eSVOgjSQvnI4CgYIARAAGA4SNwF-L9Ir9_KfQnXwsfW_MpwdrJ89eFNnc24Zq5_yjqtmI2XjecAaMkSibsspEgo_NzJwC6INoOc",
            token_uri: "https://oauth2.googleapis.com/token"
        });
        debugLog('인증 정보 설정됨');

        debugLog('캘린더 서비스 생성 중');
        const calendar = google.calendar({ 
            version: 'v3',
            auth: oauth2Client
        });
        debugLog('캘린더 서비스 생성됨');
        
        const event = {
            summary: args.summary,
            description: args.description,
            start: {
                dateTime: args.start_time,
                timeZone: 'Asia/Seoul', // 시간대를 Asia/Seoul로 설정
            },
            end: {
                dateTime: args.end_time,
                timeZone: 'Asia/Seoul', // 시간대를 Asia/Seoul로 설정
            }
        };
        debugLog('이벤트 객체 생성됨:', JSON.stringify(event, null, 2));

        if (args.attendees) {
            event.attendees = args.attendees.map(email => ({ email }));
            debugLog('참석자 추가됨:', event.attendees);
        }

        debugLog('이벤트 삽입 시도 중');
        const response = await calendar.events.insert({
            calendarId: 'primary', // 기본 캘린더 사용
            requestBody: event, // 이벤트 세부 정보
        });
        debugLog('이벤트 삽입 응답:', JSON.stringify(response.data, null, 2));
        return `이벤트 생성됨: ${response.data.htmlLink}`; // 이벤트 링크 반환
    } catch (error) {
        debugLog('오류 발생:');
        debugLog('오류 이름:', error.name);
        debugLog('오류 메시지:', error.message);
        debugLog('오류 스택:', error.stack);
        throw new Error(`이벤트 생성 실패: ${error.message}`); // 이벤트 생성에 실패하면 오류 발생
    }
}

// MCP 요청에 대한 도구 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
    debugLog('도구 목록 요청 받음');
    return { tools: [CREATE_EVENT_TOOL] }; // 사용 가능한 도구 반환
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    debugLog('도구 호출 요청 받음:', JSON.stringify(request, null, 2));
    
    try {
        const { name, arguments: args } = request.params; // 도구 이름 및 인수 추출
        if (!args) {
            throw new Error("인수가 제공되지 않았습니다."); // 인수가 제공되지 않은 경우 오류 발생
        }

        switch (name) {
            case "create_event": { // create_event 도구 처리
                debugLog('create_event 요청 처리 중');
                const result = await createCalendarEvent(args); // createCalendarEvent 함수 호출
                debugLog('이벤트 생성 성공:', result);
                return {
                    content: [{ type: "text", text: result }], // 성공 메시지 반환
                    isError: false, // isError를 false로 설정
                };
            }
            default:
                debugLog('알 수 없는 도구 요청됨:', name);
                return {
                    content: [{ type: "text", text: `알 수 없는 도구: ${name}` }], // 알 수 없는 도구 메시지 반환
                    isError: true, // isError를 true로 설정
                };
        }
    } catch (error) {
        debugLog('도구 호출 핸들러에서 오류 발생:', error);
        return {
            content: [
                {
                    type: "text",
                    text: `오류: ${error instanceof Error ? error.message : String(error)}`, // 오류 메시지 반환
                },
            ],
            isError: true, // isError를 true로 설정
        };
    }
});

// 서버 시작 함수
async function runServer() {
    debugLog('서버 시작 중');
    const transport = new StdioServerTransport(); // Stdio transport 생성
    await server.connect(transport); // 서버를 transport에 연결
    debugLog('서버가 transport에 연결됨');
    console.error("Calendar MCP 서버가 stdio에서 실행 중");
}

// 서버를 시작하고 오류 처리
runServer().catch((error) => {
    debugLog('치명적인 서버 오류:', error);
    console.error("서버 실행 중 치명적인 오류 발생:", error);
    process.exit(1); // 치명적인 오류가 발생하면 종료
});