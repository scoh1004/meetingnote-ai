# Meetingnote AI
회의/미팅 음성을 실시간 분석해 텍스트로 변환하고 AI로 요약을 제공하는 플랫폼입니다. 티로([https://tiro.ooo/n](https://tiro.ooo/n))를 벤치마킹하며 MySQL + Python 백엔드와 React(Next.js) 프론트엔드로 구성됩니다.

## 주요 기능
- 회원별 데이터 관리: 사용자, 인증, 조직/워크스페이스 단위 데이터 관리
- 실시간 음성 → 텍스트 변환: 스트리밍 STT(Deepgram 등)로 지연 최소화
- AI 요약: 회의 종료 또는 실시간 구간별 요약, 선택한 LLM(OpenAI, Gemini 등) 사용
- AI 키 관리: 사용자가 원하는 AI 공급자를 선택하고 API 키를 저장/갱신

## 추천 STT/LLM
- STT(청크 없이 스트리밍): Deepgram(권장), AssemblyAI, Google Speech-to-Text V2
- 요약용 LLM: OpenAI (gpt-4.1/4o), Google Gemini 1.5, Anthropic Claude 3.x

## 데이터베이스 설계 (MySQL 초안)
- users(id, email, password_hash, name, role, created_at, updated_at)
- user_settings(user_id FK users.id, timezone, locale, preferred_ai_provider)
- ai_providers(id, code, name, type[stt|llm], description)
- user_api_keys(id, user_id FK, provider_id FK, api_key_enc, created_at, updated_at)
- meetings(id, user_id FK, title, started_at, ended_at, status, language)
- transcripts(id, meeting_id FK, started_at, ended_at, text, stt_provider_id FK)
- summaries(id, meeting_id FK, summary_text, model, cost, created_at)
- audit_logs(id, user_id FK, action, metadata_json, created_at)

인덱스: `users.email` unique, `meetings.user_id`, `transcripts.meeting_id, started_at`, `summaries.meeting_id`. 대용량 텍스트는 향후 객체 스토리지(예: S3)로 분리 가능.

## 화면 구성 / UX 플로우
- 로그인 화면: 이메일/비밀번호, 소셜 로그인 여지, 비밀번호 찾기/회원가입 동선
- 설정 화면: 프로필(이름/타임존), 선호 LLM 선택, AI API 키 입력/검증, 요약 길이/톤 옵션
- 실시간 음성 변환 화면: 마이크/입력 토글, 라이브 텍스트 영역, 화자 레이블, STT 상태(연결/지연), 녹음 시작/종료, 실시간 요약 토글
- AI 요약 화면: 회의 목록, 요약 카드(길이, 톤, 모델 표시), 원문 보기/다운로드, 재요약 버튼

## 기술 스택
- 프론트엔드: Next.js (React), TypeScript, Tailwind/PostCSS, App Router
- 백엔드: Python(권장: FastAPI) + STT/LLM 연동, WebSocket 스트리밍
- DB: MySQL
- 인증: NextAuth/커스텀 JWT + HTTPS-only 세션 쿠키

## 개발 환경
```bash
npm install
npm run dev
# http://localhost:3000
```
주요 엔트리: `app/(auth)`(인증), `app/(dashboard)`(대시보드), 공용 컴포넌트는 `components/`.

## 추후 작업 아이디어
- 실시간 STT WebSocket 게이트웨이 연동
- 요약 프롬프트 템플릿 관리 UI
- 회의 노트 PDF/노션 내보내기
- 비용 대시보드(모델별 사용량) 추가
