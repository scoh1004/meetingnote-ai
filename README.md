This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


프로젝트 내용
- 개요: 회의/미팅 음성 내용을 실시간 분석해 텍스트로 변환하여 제공하는 플랫폼
- 벤치마킹 사이트: 티로(https://tiro.ooo/n)
- DB: MySQL
- 백엔드언어: 파이썬
- 프론트엔드언어: 리액트

주요 기능
- 회원별 데이터 관리
- 실시간 음성을 분석해 텍스트로 변환 기능
- AI 요약 기능


화면 구성
- 회원 로그인 화면
- 회원별 설정 화면
    - AI 요약 기능은 AI(예. openai api, gemini api 등) 개발 키를 적용하는데, 고객이 사용하고 싶은 ai를 선택하여 해당 키를 입력하게함
- 실시간 음성 변환 화면
    - 청크가 없는 AI를 활용해 개발하려고 하는데, 검색해보니 Deepgram가 적당하다고 하는데, 그외 괜찮은 AI가 있으면 추가로 추천 바람
- AI 요약 화면


요청 사항
- 데이터베이스 구성
- 웹페이지 UI/UX 디자인