# -AI

HyperCLOVA X(네이버 클라우드 CLOVA Studio) API를 연동한 React + Vite 웹 애플리케이션입니다.

## 시작하기

```bash
npm install
cp .env.example .env   # 이미 생성되어 있다면 생략
```

`.env` 파일에 CLOVA Studio에서 발급받은 API 키를 입력하세요.

```
VITE_CLOVA_API_KEY=발급받은_키
VITE_CLOVA_MODEL=HCX-005
VITE_CLOVA_HOST=https://clovastudio.stream.ntruss.com
```

개발 서버 실행:

```bash
npm run dev
```

## 주의사항

현재 `src/lib/hyperclova.ts`는 **브라우저에서 직접** CLOVA Studio API를 호출하도록 구성되어 있습니다.
이 방식은 개발/테스트 용도로만 사용하고, 배포 전에는 반드시 API 키를 서버(백엔드/프록시)로 옮겨야 합니다.
브라우저에 번들된 코드에는 `VITE_CLOVA_API_KEY` 값이 그대로 노출됩니다.

또한 CLOVA Studio API가 브라우저(CORS) 요청을 허용하지 않을 수 있습니다. 이 경우 요청이
`fetch` 실패 또는 CORS 에러로 막히며, 이때는 간단한 프록시 서버(Express 등)를 추가해야 합니다.

## 스크립트

- `npm run dev` — 개발 서버 실행
- `npm run build` — 타입 체크 후 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기
- `npm run lint` — oxlint 실행
