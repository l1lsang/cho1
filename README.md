# 말랑명령 AI 과외

초등학교 1학년 학생이 AI에게 부탁하는 법을 연습하는 친근한 과외 앱입니다. Vite React, Vercel Function, OpenAI API, Firebase Auth/Firestore를 사용합니다.

## 실행

```bash
npm install
npm run dev
```

PowerShell 실행 정책 때문에 `npm`이 막히면 아래처럼 실행하세요.

```bash
cmd /c npm install
cmd /c npm run dev
```

## 환경변수

`.env.local.example`을 참고해 `.env.local`을 만드세요.

- `OPENAI_API_KEY`: OpenAI API 키입니다. 서버 전용이므로 `VITE_` 접두사를 붙이지 않습니다.
- `AI_MODEL`: OpenAI 모델 ID입니다. 기본값은 `gpt-5.5`입니다.
- `VITE_FIREBASE_*`: Firebase Web App 설정값입니다.

Vite 개발 서버에서도 `/api/chat`을 사용할 수 있도록 로컬 미들웨어를 넣어두었습니다. Vercel에 배포하면 같은 로직이 `api/chat.ts` Function으로 실행됩니다.

## Firebase

Firestore 컬렉션은 `practiceSessions`를 사용합니다. 익명 로그인을 사용하므로 Firebase Authentication에서 Anonymous provider를 켜주세요.
