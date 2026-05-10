# SmartCon (스마트콘) PWA — 빨이사오

[![version](https://img.shields.io/badge/version-v30-10b981)](.) [![license](https://img.shields.io/badge/license-proprietary-blue)](.) [![PWA](https://img.shields.io/badge/PWA-installable-f59e0b)](.) [![lang](https://img.shields.io/badge/lang-한국어%20·%20English-3b82f6)](.)

**사진 한 장으로 끝나는 AI 건강 식단 매니저** — Gemini Vision · 개인화 학습 · 의학적 검증 데이터 기반 PWA.

🌐 라이브: **https://kcolumbusr-boop.github.io/smartcon/**

### 📌 서비스 정보
- **상호**: 빨이사오 (SmartCon)
- **대표자**: 김우홍 (KColumbusR)
- **사업자등록번호**: 124-50-58628
- **통신판매업 신고**: 제2012-경기오산-0055호
- **고객센터**: 010-7473-8245 · kcolumbusr@gmail.com
- **주소**: 경기도 오산시 청학로 110-13

### 💎 요금제
| 플랜 | 가격 | 기능 |
|---|---|---|
| Free | 0원 | 일일 사진 분석 5회, 장보기 30개 |
| Pro 월간 | 5,900원/월 | 무제한 + 음성·CGM·AI 리포트·**약물-음식 상호작용 경고** |
| Pro 연간 | 49,000원/년 | 월 4,083원 상당 (31% 할인) |

> 🎁 7일 무료 체험

---

## 📱 설치·실행

### 방법 1: 라이브 사이트 직접 접속 (가장 쉬움)
https://kcolumbusr-boop.github.io/smartcon/ 모바일 브라우저로 접속 → 홈 화면에 추가.

### 방법 2: 로컬 서버
```bash
cd smartcon-app
python3 -m http.server 8765
```
같은 Wi-Fi의 스마트폰 브라우저에서 `http://<내PC의IP>:8765/` 접속.

### 📲 홈 화면에 PWA 설치 (네이티브 앱처럼)
- **iOS Safari**: 공유 → "홈 화면에 추가"
- **Android Chrome**: 우측 상단 ⋮ → "앱 설치"

설치 후엔 주소창 없이 전체 화면으로 동작하고, **새 버전이 푸시되면 자동으로 업데이트 알림 배너**가 표시됩니다.

---

## ✨ 구현된 기능

### L1 — 음식 분석 (사진·음성·다중 사진)
- **단일 / 다중 사진 통합 분석** — 한 끼를 여러 접시·각도로 찍어도 1회 Gemini 호출로 통합
- 음성 입력 (Web Speech API · Pro)
- **AI 분석 결과 캐시** — SHA-256 해시 키, 결과 JSON 30일·100건 (이미지 영구 저장 X)
- **사용자 보정 학습** — ✏️ 수정 시 portion 보정 패턴 저장 → 다음 분석 자동 적용 (EMA α=0.5)
- **AI 응답 sanity 검증** — 음수·NaN·비현실값 자동 클램프
- **이미지 자동 압축** — 1280px·JPEG q=0.8로 모든 사진 처리 (대역폭·비용 절감)
- 분석 결과 **공유** (Web Share API + 클립보드 폴백)

### L2 — 냉장고 재고
- **다중 사진 통합 스캔** (최대 5장) — 냉장고 여러 구역을 한 번에 통합 분석
- **만료 대시보드** — 🚨 만료 / ⚠️ 3일 이내 / 📅 7일 이내 카드 (클릭 → 자동 필터)
- 만료 임박 활용 레시피 자동 연결
- 위치별 분류 (냉장·냉동·야채칸·팬트리·양념)

### L3 — 장보기 자동화
- AI 자동 생성 (재고 기반)
- **마트 동선 순서 자동 분류** — 🥬 채소 → 🍎 과일 → 🥩 단백질 → 🌾 곡류 → 🥛 유제품 → 🧂 양념 → 🍪 간식
- 그룹 내 미완료 우선 + 한글 사전순 자동 정렬
- 음성 입력 다중 품목 (Pro)

### L4 — 레시피 (80개 + 개인화 추천)
- **80개 레시피** (한식·양식·다이어트·간식) — 식약처 식품영양정보·KDA·KSH·KSoLA·NIH·한식진흥원 출처
- 각 레시피에 **진짜 조리법** + 영양 8필드 + 알레르겐 + 적합 목표 + 시간대 + 건강 팁 + 주의 안내 + 출처
- **개인화 추천** (`pickRecipesV2`) — 가중치 스코어링:
  - 영양 부족 보충 +25
  - 보유 재료 매칭 +20
  - 목표 적합도 +20
  - 만료 임박 활용 +15
  - 시간대 적합 +10
  - 다양성 보너스 +10
  - **사용자 즐겨찾기 +15 / 별점 4~5 +10 / 별점 1~2 −10**
  - **알레르기 매칭 시 -100 (자동 제외)**
- **레시피 검색** (이름·재료·조리법·태그·계절·출처)
- 빠른 필터: 15분 이내 / 쉬움 / 300kcal 이하 / 단백질 20g+
- 5개 탭: 전체 / ❤️ 즐겨찾기 / 가능 / 만료 활용 / 목표 맞춤

### L5 — 건강 분석 + 인사이트
- **30일 추이 SVG 차트** — 체중·혈당·수면·걸음·유산소·근력
- **건강 목표 설정** — 체중·공복혈당. 차트에 점선 목표선 + 차이 라벨
- **식사-건강 상관 분석** — 7일/30일 평균 비교:
  - 칼로리 ↔ 체중 변화
  - 당 섭취 ↔ 공복혈당 (KDA 가이드)
  - 나트륨 ↔ 수축기 혈압 (KSH 가이드)
  - 수면 ↔ 식사 점수 (NIH)
- **추세 알림** — 7일 평균이 목표에서 ±2kg/±15mg/dL 벗어나면 주 1회 알림
- **건강 기록 미입력 시 제한 모드** — 일반 권고만 노출 + 입력 유도 카드

### 음식 궁합 + 약물 상호작용 (의학적 검증)
- **73 페어 음식 궁합** (영양 흡수·만성질환·발효 등)
- **14 카테고리·30 페어 약물-음식 상호작용** (Pro 기능)
  - 스타틴 + 자몽, 와파린 + 비타민K, 테트라사이클린 + 칼슘, 레보티록신 + 두유 등
  - severity 3단계 (critical/high/medium) + 자동 매칭 경고
- 출처 약어 명시 (NIH-ODS · FDA · MFDS · KDA · KSH · KSoLA · WHO · Linus Pauling · KMS)
- 카드마다 면책 고지 (의료법 / 식품등의 표시·광고에 관한 법률 보호)

### 부가 기능
- **오늘의 식단 플랜** — 아침·점심·저녁 시간대별 추천 + 기록 표시
- **사용자 프로필 설정** — 알레르기(8대) 자동 제외, 복용약 14군 (Pro), 건강 목표
- **다국어** — 한국어 / 영어 토글 (핵심 UI)
- **알림** — 만료 임박 / 식사 시간 / 추세 알림 (앱 활성 상태 시)
- **앱 업데이트 알림** — 새 버전 자동 감지 → 명시적 배너 (지금 / 나중에)
- **도움말 모달** (❓) — 6 섹션 사용 가이드, 신규 사용자 자동 노출
- **접근성** — ARIA 라벨, 모달 focus trap, Escape 키, 키보드 단축키 (1~5/R/P/Esc)
- 데이터 내보내기·가져오기 (JSON, **API 키 제외**)

---

## 🔒 보안·프라이버시 정책

### 이미지
- **사진은 어디에도 영구 저장되지 않습니다**
- 분석 중 메모리에만 잠시 보관 → 분석 완료/탭 전환 시 즉시 정리
- 재분석 시 즉시 결과를 위해 SHA-256 해시(64자)만 키로 사용, 결과 JSON만 IDB에 30일 보관

### API 키
- Gemini API 키는 **별도 저장소**(`smartcon_api_key`)에 분리 저장
- 백업 export 파일에는 절대 포함되지 않음
- HTTP 요청 시 URL 쿼리스트링 X — `x-goog-api-key` 헤더 사용

### 사용자 데이터
- 모든 데이터는 사용자 기기(`localStorage` + IndexedDB)에만 저장
- 외부 전송 없음 (Gemini API 호출 외)
- 프로필 설정에서 **모든 데이터 영구 삭제** 가능 (GDPR 준수)

### 보안 헤더
- CSP `default-src 'self'` + Gemini API만 외부 connect 허용
- X-Content-Type-Options: nosniff
- frame-ancestors: 'none' (clickjacking 방지)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=self, microphone=self, geolocation=()

### Pro Trial 만료 검증
- 7일 무료 체험은 `__trialStart` timestamp + `isProActive()` 헬퍼로 정확히 검증
- 만료 시 자동으로 FREE 모드 전환

---

## 🏗 아키텍처

| PRD 컴포넌트 | PWA 구현 |
|---|---|
| Flutter 앱 | 반응형 HTML + CSS (모바일 최적화, 480px 고정폭) |
| FastAPI Core | LocalStorage + IndexedDB + JS 상태 관리 |
| Claude Vision + YOLOv8 | **Gemini 2.5 Flash Vision** (사용자 본인 키, 헤더 인증) + mock 폴백 |
| PostgreSQL (meals/inventory) | `state.meals`, `state.inventory` |
| TimescaleDB (nutrition_ts/health_ts) | 시간 기반 배열 + 일별 aggregation |
| Qdrant (벡터 검색) | 태그 + 재료 교집합 + **사용자 보정 학습** (EMA) |
| Redis (큐) | setTimeout · 분석 캐시 (IndexedDB 30일 TTL) |
| 토스페이먼츠/쿠팡 API | 벤더 시뮬레이션 (쿠팡/컬리/SSG/오아시스) |
| CGM 연동 | Pro 배지 표시 (실제 연결은 네이티브 앱 필요) |

**실제 프로덕션 전환 시**: `state.meals.push()` → `await fetch('/v1/meals', ...)` 같은 API 호출로 교체.

---

## 📂 파일 구조

```
smartcon-app/
├── index.html       # 메인 앱 (HTML + CSS + JS 단일 파일, ~10000줄)
├── manifest.json    # PWA 설치 매니페스트 (start_url=/smartcon/)
├── sw.js            # Service Worker (Network-First HTML, 자동 업데이트)
├── _headers         # Cloudflare/Netlify 헤더 (CSP·보안 정책)
├── icon-192.png     # 앱 아이콘 (192×192)
├── icon-512.png     # 앱 아이콘 (512×512)
├── icon-maskable-512.png  # PWA maskable 아이콘
└── README.md        # 이 문서
```

---

## ⚠️ 의학적 면책 고지

본 서비스의 모든 음식 궁합·영양 정보·약물 상호작용·건강 인사이트는 식품의약품안전처(MFDS)·대한당뇨병학회(KDA)·대한고혈압학회(KSH)·대한지질·동맥경화학회(KSoLA)·대한의학회(KMS)·NIH ODS·FDA·WHO·Linus Pauling Institute 등의 **일반 가이드라인 기반 권고**입니다.

- 의학적 진단·처방·치료를 **대체하지 않습니다**
- 개인의 체질·기저질환·복용약·소화 능력·알레르기에 따라 결과가 다를 수 있습니다
- 만성질환자·임산부·수유부·소아·복용약 있는 분은 반드시 **의사·약사·영양사** 상담 후 식단 결정
- 식품등의 표시·광고에 관한 법률상 효능·기능성 표시가 아니며, 본 정보 의존으로 발생한 손해에 회사는 책임지지 않습니다

---

## 🔄 버전 히스토리

- **v30** — 업데이트 알림 배너, 다국어 i18n 1차, 식단 플랜, 만료 대시보드, 도움말 모달, FOOD_DB 62종
- **v29** — 다음 식사 AI 추천
- **v28** — 주의 대상자 안내 + 책임 회피 강화
- **v27** — 직관적 점수 UX (등급제 + 시맨틱 라벨)
- **v26** — 당뇨 정밀 평가 + 의료 자문 패널
- **v25** — 음식 판정 + 영양 검증 시스템
- **v24** — 초기 PRD MVP

---

## 🐛 이슈·문의

- GitHub: https://github.com/kcolumbusr-boop/smartcon
- 이메일: kcolumbusr@gmail.com
- 전화: 010-7473-8245
