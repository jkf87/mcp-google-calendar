import { google } from 'googleapis'; // Google API 클라이언트 라이브러리
import { promises as fs } from 'fs'; // 파일 시스템 접근을 위한 fs 모듈
import * as dotenv from 'dotenv'; // 환경 변수 로딩을 위한 dotenv 모듈

dotenv.config(); // .env 파일에서 환경 변수를 로드

const SCOPES = ['https://www.googleapis.com/auth/calendar']; // Google Calendar API 접근 범위

/**
 * refresh token을 얻어오는 함수
 */
async function getRefreshToken() {
  // OAuth2 클라이언트 생성
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID, // 클라이언트 ID
    process.env.CLIENT_SECRET, // 클라이언트 시크릿
    process.env.REDIRECT_URI // 리디렉션 URI
  );

  // 인증 URL 생성
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 오프라인 접근 허용 (refresh token을 얻기 위해 필요)
    scope: SCOPES, // 접근 범위
    prompt: 'consent' // 사용자에게 동의를 구함
  });

  // 인증 URL 출력
  console.log('Authorize this app by visiting this url:', authUrl);
  console.log('After authorization, copy the code from the redirect URL');
  
  // 사용자 입력을 기다림
  const code = await new Promise(resolve => {
    process.stdin.resume(); // 표준 입력 스트림 재개
    process.stdin.on('data', data => { // 데이터 수신 이벤트 핸들러
      process.stdin.pause(); // 표준 입력 스트림 일시 중지
      resolve(data.toString().trim()); // 입력된 코드 resolve
    });
  });

  try {
    // 코드를 사용하여 토큰을 얻음
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nYour refresh token:', tokens.refresh_token); // refresh token 출력
    console.log('\nUpdate this token in your index.js file in the createCalendarEvent function'); // refresh token 사용법 안내
    
    // 디버깅용 전체 토큰 정보 출력
    console.log('\nFull token information:', JSON.stringify(tokens, null, 2));
  } catch (error) {
    // 에러 처리
    console.error('Error getting tokens:', error);
  }
}

// refresh token 얻어오는 함수 실행 및 에러 핸들링
getRefreshToken().catch(console.error);