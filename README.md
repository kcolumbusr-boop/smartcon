# SmartCon (스마트콘) PWA — 빨이사오

[![version](https://img.shields.io/badge/version-v24-10b981)](.) [![license](https://img.shields.io/badge/license-proprietary-blue)](.) [![PWA](https://img.shields.io/badge/PWA-installable-f59e0b)](.)

**사진 한 장으로 끝나는 AI 건강 식단 매니저** — PRD v1.0 MVP를 구현한 Progressive Web App.

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
| Pro 월간 | 5,900원/월 | 무제한 + 음성·CGM·AI 리포트 |
| Pro 연간 | 49,000원/년 | 월 4,083원 상당 (31% 할인) |

> 🎁 7일 무료 체험

## 📱 스마트폰에서 설치·실행하는 3가지 방법

### 방법 1: 로컬 서버로 띄워서 스마트폰에서 접속 (가장 빠름)

```bash
cd SmartCon
python3 -m http.server 8765
```

같은 Wi-Fi의 스마트폰 브라우저에서 `http://<내PC의IP>:8765/` 접속.

### 방법 2: GitHub Pages / Netlify / Vercel 무료 배포

`SmartCon` 폴더 통째로 업로드 → HTTPS URL 발급. 스마트폰에서 접속 후 "홈 화면에 추가".

### 방법 3: 파일 더블클릭 (로컬 테스트용)

`index.html`을 Chrome/Safari로 열기. 카메라·서비스워커는 HTTPS/localhost에서만 동작하므로 방법 1 권장.

### 📲 홈 화면에 추가 (네이티브 앱처럼)

- **iOS Safari**: 공유 → "홈 화면에 추가"
- **Android Chrome**: 우측 상단 ⋮ → "앱 설치"

추가 후에는 주소창 없이 전체 화면으로 열려 진짜 네이티브 앱처럼 동작합니다.

---

## ✨ 구현된 기능 (PRD 5개 레이어 모두)

| Layer | 기능 | 구현 상태 |
|---|---|---|
| **L1** 음식 분석 | 사진 업로드 · AI 인식 · 영양 분석 · 목표별 점수 · 혈당 예측 · 궁합 추천 | ✅ 카메라 + 갤러리 + 모의 AI 분석 |
| **L2** 냉장고 스캔 | 사진 스캔 · 품목 자동 인식 · 유통기한 추적 · 만료 임박 알림 | ✅ 스캔 시뮬레이션 + 재고 관리 |
| **L3** 장보기 자동화 | 재고 기반 리스트 생성 · 가격 비교 · 원클릭 주문 | ✅ AI 자동 생성 + 4개 벤더 시뮬레이션 |
| **L4** 레시피 추천 | 보유 재료 매칭 · 만료 임박 활용 · 목표 맞춤 | ✅ 8개 레시피 DB + 필터링 |
| **L5** 패턴 분석 | 주간 리포트 · 목표별 평균 점수 · 건강 지표 · 인사이트 | ✅ 차트 + 상관 엔진 모의 |

### 부가 기능
- 온보딩 플로우 (Mifflin-St Jeor 기반 목표 kcal 자동 계산)
- 연속 기록 일수 (Streak) 카운트
- LocalStorage 기반 완전 오프라인 동작
- Service Worker로 오프라인 캐싱
- 한식 중심 30종 영양 DB 내장
- BMI 자동 계산
- 데이터 내보내기 (JSON 백업)
- 브라우저 알림 (만료 임박 · 식사 시간)

---

## 🏗 아키텍처 매핑 (PRD ↔ PWA)

| PRD 컴포넌트 | PWA 구현 |
|---|---|
| Flutter 앱 | 반응형 HTML + CSS (모바일 최적화, 480px 고정폭) |
| FastAPI Core API | LocalStorage + JS 상태 관리 |
| Claude Vision + YOLOv8 | 모의 AI 분석 (1.5초 지연 + 랜덤 인식 + 실제 영양 DB 계산) |
| PostgreSQL (meals/inventory) | `state.meals`, `state.inventory` |
| TimescaleDB (nutrition_ts/health_ts) | 시간 기반 배열 + 일별 aggregation |
| Qdrant (벡터 검색) | 태그 + 재료 교집합 매칭 |
| Redis (큐) | setTimeout 모사 |
| 토스페이먼츠/쿠팡 API | 벤더 시뮬레이션 (쿠팡/컬리/SSG/오아시스) |
| CGM 연동 | Pro 배지 표시 (API 연결은 네이티브 앱에서 필요) |

**실제 프로덕션 전환 시**: `state.meals.push()` 같은 모든 지점을 `await fetch('/v1/meals', ...)` API 호출로 교체하면 PRD 백엔드와 바로 연결됩니다.

---

## 🧪 확인된 동작

- [x] 온보딩 → 목표 kcal 자동 계산
- [x] 카메라 촬영 / 갤러리 업로드
- [x] 음식 인식 시뮬레이션 + 영양 3D 스코어 링
- [x] 식사 기록 저장 → 홈 대시보드 즉시 반영
- [x] 냉장고 AI 스캔 모의 (품목 3~5개 자동 감지)
- [x] 유통기한 D-day 경고 (빨강/노랑/초록 뱃지)
- [x] 장보기 자동 생성 + 4개 벤더 가격 비교
- [x] 보유 재료 기반 레시피 매칭 점수
- [x] 주간 차트 + 인사이트 엔진
- [x] LocalStorage 영속화 + JSON 내보내기
- [x] Service Worker 오프라인 캐싱

---

## 파일 구조

```
SmartCon/
├── index.html       # 메인 앱 (HTML + CSS + JS 단일 파일, 83KB)
├── manifest.json    # PWA 설치 매니페스트
├── sw.js            # Service Worker (오프라인)
├── icon-192.png     # 앱 아이콘
├── icon-512.png     # 앱 아이콘
└── README.md        # 이 문서
```
