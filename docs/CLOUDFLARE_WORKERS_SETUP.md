# Cloudflare Workers — 쿠팡 파트너스 백엔드 배포 가이드

SmartCon은 GitHub Pages 정적 호스팅이라 쿠팡 파트너스의 secret key를 안전하게 보관할 수 없습니다. 이 백엔드 워커가 그 역할을 합니다.

## 작동 흐름

```
[SmartCon 앱] → POST /api { query: "딸기" }
                ↓
[Cloudflare Worker] — secret key는 환경변수
                ↓ HMAC-SHA256 서명
[쿠팡 파트너스 Deeplink API]
                ↓ 추적 단축 URL 반환
[Worker] → { ok: true, data: { shortenUrl, landingUrl } }
                ↓
[SmartCon] window.open(shortenUrl)
```

## 사전 준비

1. **쿠팡 파트너스 가입 완료** — kr.coupang.com/partners
2. **access key / secret key 발급** — 가입 통과 후 마이페이지에서 확인
3. **Cloudflare 무료 계정** — cloudflare.com (이메일만 가입)
4. **Node.js + npm** (로컬 PC에 설치, wrangler CLI 용)

## 배포 단계 (10분 안에 끝)

### 1. wrangler CLI 설치

```bash
npm install -g wrangler
wrangler login   # 브라우저로 Cloudflare 계정 로그인
```

### 2. 환경변수 (secret) 설정

worker 디렉토리에서:

```bash
cd smartcon-app/worker

wrangler secret put COUPANG_ACCESS_KEY
# 프롬프트가 뜨면 파트너스에서 받은 access key 붙여넣기

wrangler secret put COUPANG_SECRET_KEY
# secret key 붙여넣기
```

⚠️ 이 키들은 **절대 코드·git에 커밋하지 마세요**. wrangler secret으로만 보관.

### 3. 배포

```bash
wrangler deploy
```

성공하면 다음과 같은 URL이 출력됩니다:

```
✓ Published smartcon-coupang-affiliate (xx.xx.xx)
  https://smartcon-coupang-affiliate.<yourname>.workers.dev
```

이 URL을 복사해두세요.

### 4. SmartCon 앱에서 worker URL 등록

SmartCon 앱 → 프로필 → "🤖 AI 연결" 카드 아래에 **"쿠팡 파트너스 워커 URL"** 입력 필드가 있습니다. 거기에 위 URL을 붙여넣고 저장.

(또는 코드에서 `state.settings.coupangWorkerUrl`로 저장됨)

### 5. 동작 확인

1. 장보기 → 가격 비교에서 🛍 쿠팡 클릭 → 모달 → 항목 🔎 검색
2. 정상 동작이면 새 탭에 쿠팡 단축 URL (`link.coupang.com/...`) 로 열림
3. 사용자가 결제하면 24시간 안에 파트너스 대시보드에 트래픽 기록

## 무료 티어 한도

| 자원 | 무료 한도 | 우리 사용량 추정 |
|---|---|---|
| 요청 수 | **100,000 / 일** | 사용자 5,000명 × 일 20회 = 한도 |
| CPU 시간 | 10ms / 요청 | HMAC 계산 < 1ms (여유) |
| 메모리 | 128MB / 요청 | 충분 |

초과 시 자동 차단 (요금 부과 X). 더 큰 트래픽 예상되면 유료 ($5/월 = 1,000만 요청).

## 도메인 변경 (선택)

기본 URL `*.workers.dev`가 길어서 깔끔하게 하려면:
1. Cloudflare에서 도메인 등록 ($10~)
2. Workers Routes에서 `api.yourdomain.com/coupang` 같은 경로에 워커 연결

## CORS 보안

`coupang-affiliate.js` 상단의 `ALLOWED_ORIGINS` 배열에 우리 앱 도메인만 등록:

```js
const ALLOWED_ORIGINS = [
  'https://kcolumbusr-boop.github.io',
  'http://localhost:8765'   // 로컬 개발용 (선택)
];
```

다른 도메인에서 호출 시 CORS 차단. 보안 보강.

## 키 갱신 / 비활성화

```bash
wrangler secret put COUPANG_ACCESS_KEY    # 새 값 입력
wrangler secret put COUPANG_SECRET_KEY    # 새 값 입력

wrangler secret delete COUPANG_ACCESS_KEY # 키 비활성화 (긴급)
```

## 트러블슈팅

### worker가 401/403 반환
- access/secret key가 정확한지 확인
- 파트너스 가입 심사 통과됐는지 확인 (pending 상태에선 API 호출 거부)
- key 앞뒤 공백 없는지 (wrangler secret 입력 시 trim)

### CORS 에러
- `ALLOWED_ORIGINS`에 우리 도메인이 들어있는지
- 변경 후 `wrangler deploy` 재실행

### 단축 URL이 안 만들어짐
- 검색 URL 형식이 `https://www.coupang.com/np/search?q=...` 인지
- 한국어 검색어는 자동 encodeURIComponent됨

## 로컬 테스트

```bash
cd smartcon-app/worker
wrangler dev
# → http://localhost:8787 에서 테스트
```

curl로 테스트:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"query": "딸기"}'
```

## 비용·수익 시뮬레이션

| 사용자 | 일 요청 | 월 요청 | Worker 비용 | 파트너스 수수료 (추정) |
|---|---|---|---|---|
| 100명 | 2,000 | 60,000 | **무료** | ~12만원 (1% 전환 가정) |
| 1,000명 | 20,000 | 600,000 | **무료** | ~120만원 |
| 10,000명 | 200,000 | 6,000,000 | $5/월 (유료 전환) | ~1,200만원 |

수익 vs 인프라 비용 비율이 매우 좋습니다.

## 면책

- 본 워커는 사용자 본인의 파트너스 키만 사용
- SmartCon은 트래픽 중계만 하고 사용자 결제·정산에는 관여 X
- 파트너스 약관 위반은 사용자 본인 책임 (자기 클릭·가족 추천 등 금지)
