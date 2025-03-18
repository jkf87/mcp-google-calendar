# Firebase를 이용한 Google Calendar MCP 서버 설정 가이드

## 목차
1. [소개](#소개)
2. [사전 준비사항](#사전-준비사항)
3. [프로젝트 설치](#프로젝트-설치)
4. [Firebase 프로젝트 설정](#Firebase-프로젝트-설정)
5. [Google Calendar API 활성화](#Google-Calendar-API-활성화)
6. [OAuth 동의 화면 설정 및 내부/외부 앱 선택](#OAuth-동의-화면-설정-및-내부외부-앱-선택)
7. [환경 변수 설정](#환경-변수-설정)
8. [인증 및 토큰 획득](#인증-및-토큰-획득)
9. [서버 실행](#서버-실행)
10. [MCP 서버 구조 및 작동 원리](#MCP-서버-구조-및-작동-원리)
11. [문제 해결](#문제-해결)

## 소개

이 가이드는 Firebase를 이용하여 Google Calendar MCP(Model Context Protocol) 서버를 설정하는 방법을 설명합니다. MCP 서버를 통해 Claude와 같은 AI 어시스턴트가 Google Calendar에 이벤트를 생성할 수 있게 됩니다.

MCP(Model Context Protocol)는 AI 어시스턴트가 외부 서비스와 통신할 수 있게 해주는 프로토콜입니다. 이 프로젝트는 Google Cloud Console 대신 Firebase를 사용하여 더 쉽게 OAuth2 인증을 설정하고 Google Calendar API에 접근하는 방법을 제공합니다.

## 사전 준비사항

이 프로젝트를 진행하기 위해 필요한 사전 준비사항:

- Node.js v18 이상 설치
- 명령줄(터미널/커맨드 프롬프트) 사용 가능
- Firebase 계정 (없을 경우 무료로 가입 가능)
- Google 계정 (Calendar 접근을 위해 필요)

## 프로젝트 설치

1. 저장소 복제:
   ```bash
   git clone https://github.com/markelaugust74/mcp-google-calendar.git
   cd mcp-google-calendar
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

## Firebase 프로젝트 설정

Firebase 프로젝트를 생성하고 서비스 계정을 설정하는 과정입니다.

1. Firebase 콘솔 접속
   - [Firebase 콘솔](https://console.firebase.google.com/)에 접속합니다.
   - Google 계정으로 로그인합니다.

2. 새 프로젝트 생성
   - "프로젝트 추가" 버튼을 클릭합니다.
   - 프로젝트 이름을 입력합니다 (예: "mcp-google-calendar").
   - Google 애널리틱스 설정은 선택 사항입니다 (이 프로젝트에서는 필요 없음).
   - "프로젝트 만들기" 버튼을 클릭합니다.

3. 서비스 계정 설정
   - 프로젝트가 생성되면, 왼쪽 상단의 설정 아이콘(⚙️)을 클릭하고 "프로젝트 설정"을 선택합니다.
   - "서비스 계정" 탭으로 이동합니다.
   - "Firebase Admin SDK" 섹션에서 "새 비공개 키 생성" 버튼을 클릭합니다.
   - JSON 형식의 서비스 계정 키 파일이 다운로드됩니다.
   - 이 파일을 안전한 위치에 저장하고, 경로를 기억해두세요 (환경 변수 설정 시 필요).

## Google Calendar API 활성화

Firebase 프로젝트에서 Google Calendar API를 활성화하는 과정입니다.

1. Firebase 인증 설정
   - Firebase 콘솔에서 "Authentication" > "Sign-in method"로 이동합니다.
   - "Google"을 클릭하고 활성화합니다.
   - 저장합니다.

2. Google Calendar API 활성화
   - [Google Cloud Console](https://console.cloud.google.com/)로 이동합니다.
   - 상단 프로젝트 선택 드롭다운에서 Firebase 프로젝트를 선택합니다.
   - 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리"를 클릭합니다.
   - 검색창에 "Google Calendar API"를 입력하고 검색합니다.
   - Google Calendar API 결과를 클릭하고 "사용 설정" 버튼을 클릭합니다.

## OAuth 동의 화면 설정 및 내부/외부 앱 선택

사용자 인증을 위한 OAuth 동의 화면을 설정하고 앱 유형(내부/외부)을 선택하는 과정입니다.

1. OAuth 동의 화면 접근
   - Google Cloud Console에서 Firebase 프로젝트로 이동합니다.
   - 왼쪽 메뉴에서 "API 및 서비스" > "OAuth 동의 화면"을 클릭합니다.
   - 직접 링크: [OAuth 동의 화면](https://console.cloud.google.com/apis/credentials/consent)

2. 앱 유형 선택 (중요)
   - **내부 앱(Internal)** 또는 **외부 앱(External)** 중 하나를 선택합니다.
   - **중요**: Google Workspace(G Suite) 사용자가 아닌 일반 Google 계정 사용자는 **내부 앱 옵션이 비활성화**되어 있습니다. 이 경우 **외부 앱(External)**으로 선택해야 합니다.
   - 이 선택은 앱의 접근성과 검증 요구사항에 영향을 줍니다.

   ### 내부 앱(Internal)의 특징:
   - 동일한 Google Workspace 조직 내의 사용자만 접근 가능
   - Google Workspace(G Suite) 계정이 있어야 선택 가능
   - 앱 검증이 필요 없음
   - 빠르게 설정 가능
   - 테스트 사용자 추가 불필요
   - Google API 동의 화면에 경고가 표시되지 않음
   
   ### 외부 앱(External)의 특징:
   - 모든 Google 계정 사용자가 잠재적으로 접근 가능
   - 일반 Google 계정 사용자는 이 옵션만 선택 가능
   - 최대 100명의 테스트 사용자 지정 필요
   - 프로덕션으로 전환 시 앱 검증 필요 (사용자가 100명 초과 시)
   - 검증 전에는 사용자에게 "검증되지 않은 앱" 경고 표시
   
   ### 앱 유형 선택 가이드:
   - Google Workspace 계정이 있고, 조직 내부에서만 사용할 경우: **내부 앱**
   - 일반 Google 계정을 사용하는 경우: **외부 앱** (유일한 옵션)
   - 일반 사용자에게 배포할 계획이 있는 경우: **외부 앱**

3. OAuth 동의 화면 구성
   - 앱 이름, 사용자 지원 이메일, 개발자 연락처 정보 등 필수 정보를 입력합니다.
   - 내부 앱의 경우 이 정보는 간단하게 설정해도 됩니다.
   - 외부 앱의 경우 사용자에게 표시될 정보이므로 주의하여 작성합니다.

4. 범위 설정
   - "범위 추가" 버튼을 클릭합니다.
   - `https://www.googleapis.com/auth/calendar` 스코프를 추가합니다. (Google Calendar 접근용)
   - 필요한 다른 스코프가 있다면 함께
   추가합니다.

5. 테스트 사용자 설정 (외부 앱의 경우)
   - 외부 앱을 선택한 경우, "테스트 사용자" 섹션에서 테스트 사용자를 추가합니다.
   - **중요**: 일반 Google 계정으로 외부 앱을 설정한 경우 이 단계는 필수입니다.
   - 본인의 이메일 주소를 테스트 사용자로 추가해야 합니다.
   - 테스트 단계에서는 이 목록에 추가된 사용자들만 앱에 접근할 수 있습니다.
   - 내부 앱의 경우 이 단계는 필요 없습니다.

6. 변경사항 저장
   - "저장 후 계속" 버튼을 클릭하여 설정을 완료합니다.
   - 외부 앱의 경우 추가 정보(개발자 연락처, 홈페이지 URL 등)를 입력해야 할 수 있습니다.
   - 모든 필수 정보를 입력하고 저장하면 앱이 "테스트" 상태로 생성됩니다.

## 환경 변수 설정

환경 변수를 설정하여 애플리케이션이 Firebase 서비스 계정에 접근할 수 있도록 합니다.

1. .env 파일 생성
   - 프로젝트 루트 디렉토리에 `.env.example` 파일을 `.env`로 복사합니다:
     ```bash
     cp .env.example .env
     ```

2. 환경 변수 편집:
   - `.env` 파일을 텍스트 편집기로 열고 다음 변수들을 설정합니다. 필요에 따라 값을 변경하세요.
     ```
     FIREBASE_SERVICE_ACCOUNT_PATH=./path-to-your-firebase-credentials.json
     REDIRECT_URI=http://localhost:3000/oauth2callback
     TIMEZONE=Asia/Seoul
     ```
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: Firebase 콘솔에서 다운로드한 서비스 계정 JSON 파일의 실제 경로로 변경합니다.
   - `REDIRECT_URI`: Google OAuth2 인증 후 리디렉션될 URI를 설정합니다. 기본값은 `http://localhost:3000/oauth2callback`입니다. 필요에 따라 변경할 수 있습니다.
   - `TIMEZONE`: 사용할 시간대를 설정합니다. 기본값은 `Asia/Seoul`입니다.

## 인증 및 토큰 획득

Google Calendar API에 접근하기 위한 OAuth2 토큰을 획득하는 과정입니다.

1. 인증 프로세스 실행
   ```bash
   npm run auth
   ```

2. 브라우저 인증
   - 명령을 실행하면 브라우저가 자동으로 열리고 Google 로그인 페이지가 표시됩니다.
   - Google 계정으로 로그인합니다.
   - 권한 요청 화면이 나타나면 "허용"을 클릭합니다.
   - 브라우저에 리디렉션된 URL에 표시된 코드를 복사합니다.

3. 코드 입력
   - 터미널에 복사한 코드를 붙여넣고 Enter 키를 누릅니다.
   - 인증이 성공하면 액세스 토큰과 리프레시 토큰 정보가 표시됩니다.
   - 토큰 정보는 자동으로 `.token-cache.json` 파일에 저장됩니다.

## 서버 실행

MCP 서버를 실행하는 방법입니다.

1. 서버 시작
   ```bash
   npm start
   ```

2. 서버 실행 확인
   - 터미널에 "Calendar MCP 서버가 stdio에서 실행 중" 메시지가 표시되면 서버가 성공적으로 실행된 것입니다.
   - 이제 Claude와 같은 AI 어시스턴트가 이 MCP 서버를 통해 Google Calendar API에 접근할 수 있습니다.

## MCP 서버 구조 및 작동 원리

MCP 서버의 구조와 자연어 요청이 어떻게 Google Calendar API 호출로 변환되는지 설명합니다.

### 서버 구조

```
Claude/AI 어시스턴트 -> MCP 요청(ListTools, CallTool) -> MCP 서버
    -> 요청 핸들러 -> create_event 툴 핸들러 -> Google Calendar API 호출
    -> OAuth2 인증 -> 환경 변수 및 토큰 캐시
```

### 자연어 요청 처리 흐름

1. **사용자의 자연어 요청**
   - 사용자가 Claude에게 "내일 오전 10시에 회의 일정을 잡아줘"와 같이 자연어로 요청합니다.

2. **Claude의 요청 처리**
   - Claude는 요청을 분석하고 의도를 파악합니다.
   - 적절한 도구(`create_event`)를 선택합니다.
   - 필요한 파라미터(제목, 시작/종료 시간, 설명 등)를 추출합니다.
   - MCP `CallToolRequest`를 생성합니다.
   - 요청을 MCP 서버로 전송합니다.

3. **MCP 서버의 요청 처리**
   - 서버는 요청을 수신하고 적절한 도구 핸들러(create_event)를 호출합니다.
   - Firebase Admin SDK를 통해 인증을 처리합니다.
   - Google Calendar API를 호출하여 일정을 생성합니다.
   - 결과를 Claude에게 반환합니다.

4. **Claude의 응답 처리**
   - Claude는 서버의 응답을 자연어로 변환하여 사용자에게 전달합니다.
   - 예: "내일 오전 10시에 회의 일정을 추가했습니다."

## 문제 해결

Firebase와 Google Calendar MCP 서버 설정 중 발생할 수 있는 일반적인 문제와 해결 방법입니다.

### 인증 오류

- **문제**: 인증 과정에서 "OAuth2 인증 실패" 오류가 발생합니다.
- **해결방법**: 
  - Firebase 프로젝트에서 Google 인증 제공업체가 활성화되어 있는지 확인하세요.
  - 서비스 계정 JSON 파일 경로가 올바르게 설정되어 있는지 확인하세요.
  - Google Cloud Console에서 OAuth 동의 화면이 올바르게 설정되어 있는지 확인하세요.

### Google Calendar API 오류

- **문제**: "Google Calendar API has not been used in project" 오류가 발생합니다.
- **해결방법**: 
  - Google Cloud Console에서 Google Calendar API가 활성화되어 있는지 확인하세요.
  - Firebase 프로젝트와 Google Cloud 프로젝트가 올바르게 연결되어 있는지 확인하세요.

### 토큰 관련 오류

- **문제**: "토큰 캐시 파일을 읽을 수 없음" 오류가 발생합니다.
- **해결방법**: 
  - `npm run auth` 명령을 실행하여 새로운 토큰을 획득하세요.
  - `.token-cache.json` 파일이 프로젝트 루트 디렉토리에 생성되었는지 확인하세요.

### 환경 변수 오류

- **문제**: "FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set" 오류가 발생합니다.
- **해결방법**: 
  - `.env` 파일이 프로젝트 루트 디렉토리에 있는지 확인하세요.
  - `FIREBASE_SERVICE_ACCOUNT_PATH` 변수가 올바른 경로로 설정되어 있는지 확인하세요.

### OAuth 동의 화면 관련 오류

- **문제**: "앱이 확인되지 않았습니다" 경고가 표시됩니다.
- **해결방법**:
  - 외부 앱으로 설정한 경우 정상적인 현상입니다.
  - 일반 Google 계정 사용자는 이 경고를 무시하고 "계속"을 클릭하여 진행할 수 있습니다.
  - 내부 앱으로 변경하거나(Google Workspace 계정 필요), 테스트 사용자 목록에 현재 사용자를 추가하세요.
  - 프로덕션 환경으로 전환하려면 앱 검증 과정을 진행하세요.

- **문제**: 테스트 사용자만 앱에 접근할 수 있습니다.
- **해결방법**:
  - 외부 앱의 경우 정상적인 동작입니다.
  - 테스트 사용자 목록에 필요한 사용자를 추가하세요.
  - 모든 사용자에게 개방하려면 앱 검증 프로세스를 진행하고 프로덕션으로 전환하세요.

- **문제**: "You don't have access" 또는 "Invalid Client" 오류가 표시됩니다.
- **해결방법**:
  - OAuth 동의 화면에서 본인의 이메일이 테스트 사용자로 추가되어 있는지 확인하세요.
  - API 키와 OAuth 클라이언트 ID가 올바르게 설정되어 있는지 확인하세요.
  - Google Cloud Console에서 사용자 인증 정보(Credentials) 페이지로 이동하여 OAuth 클라이언트 ID가 생성되어 있는지 확인하세요.

---

이 가이드를 통해 Firebase를 이용한 Google Calendar MCP 서버를 성공적으로 설정할 수 있기를 바랍니다. 더 자세한 정보나 지원이 필요하면 GitHub 저장소의 이슈 트래커를 이용해 주세요. 