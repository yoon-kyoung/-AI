# -AI

개인화된 국민연금+퇴직연금 통합 시뮬레이터와 HyperCLOVA X(네이버 클라우드 CLOVA Studio) 챗 데모를
포함한 React + Vite 웹 애플리케이션입니다.

## 페이지 구성

- `/` — 연금 시뮬레이터: 프로필 기반 국민연금·퇴직연금 예상액, 가입 공백 시나리오 비교,
  연금저축/IRP 세액공제 최적화 결과를 보여줍니다.
- `/profile` — 내 프로필: 나이/소득/고용형태/국민연금 가입 이력(공백 기간 포함)/퇴직연금/
  세액공제 납입액을 입력합니다. 값은 브라우저 `localStorage`에만 저장됩니다.
- `/chat` — HyperCLOVA X 챗 데모.

계산 로직(`src/lib/nationalPension.ts`, `retirementPension.ts`, `taxDeduction.ts`)은 2026년
기준 제도(국민연금 개혁법상 보험료율 9.5%·소득대체율 43%, 연금계좌 세액공제 900만원 한도 등)를
반영한 **근사 계산**입니다. 실제 가입 이력의 소득 재평가 등은 단순화되어 있어 공식 수급액과는
차이가 있을 수 있습니다.

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
