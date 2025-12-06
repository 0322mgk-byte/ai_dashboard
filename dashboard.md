# AI Credits Dashboard - Product Requirements Document (PRD)

**버전:** 1.0  
**작성일:** 2024년 12월 5일  
**프로젝트 코드명:** AI Credits Tracker

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [문제 정의](#문제-정의)
3. [목표 및 목적](#목표-및-목적)
4. [타겟 사용자](#타겟-사용자)
5. [핵심 기능](#핵심-기능)
6. [기술 스택](#기술-스택)
7. [시스템 아키텍처](#시스템-아키텍처)
8. [사용자 스토리](#사용자-스토리)
9. [UI/UX 요구사항](#uiux-요구사항)
10. [기술적 요구사항](#기술적-요구사항)
11. [성공 지표](#성공-지표)
12. [개발 마일스톤](#개발-마일스톤)
13. [향후 확장 계획](#향후-확장-계획)
14. [리스크 및 대응 방안](#리스크-및-대응-방안)

---

## 프로젝트 개요

### 제품 설명
AI Credits Dashboard는 여러 AI 이미지/영상 생성 서비스(Kling AI, Google Flow 등)의 잔여 크레딧을 한눈에 확인할 수 있는 통합 대시보드입니다. Chrome 확장 프로그램과 웹 대시보드의 조합으로, 각 서비스 웹사이트를 일일이 방문하지 않고도 실시간으로 크레딧 현황을 파악할 수 있습니다.

### 핵심 가치 제안
- **시간 절약**: 여러 사이트를 방문할 필요 없이 한 곳에서 모든 크레딧 확인
- **자동화**: Chrome 확장 프로그램이 자동으로 크레딧 정보 수집
- **확장성**: 새로운 AI 서비스를 쉽게 추가 가능
- **보안**: 사용자의 브라우저 세션 활용으로 별도 로그인 불필요

---

## 문제 정의

### 현재 Pain Points
1. **분산된 정보**: Kling AI, Google Flow, Midjourney 등 각 서비스마다 별도 로그인 필요
2. **시간 낭비**: 크레딧 확인을 위해 매번 여러 사이트를 방문해야 함
3. **크레딧 관리 어려움**: 언제 크레딧이 소진되는지 실시간으로 파악 어려움
4. **예산 초과 위험**: 크레딧 부족 상태를 늦게 발견하여 작업 중단

### 해결 방안
- Chrome 확장 프로그램으로 각 사이트 방문 시 자동으로 크레딧 정보 수집
- 통합 대시보드에서 모든 서비스의 크레딧을 한눈에 시각화
- 실시간 업데이트 및 히스토리 추적

---

## 목표 및 목적

### 주요 목표
1. **MVP 개발**: Kling AI와 Google Flow 2개 서비스 지원
2. **자동화 달성**: 수동 입력 없이 자동으로 크레딧 정보 수집
3. **사용자 친화적 UI**: 직관적이고 깔끔한 대시보드 제공
4. **확장 가능한 구조**: 향후 10개 이상의 서비스 추가 가능한 아키텍처

### 비즈니스 목표
- 개인 생산성 향상: 크레딧 확인 시간 90% 단축 (10분 → 1분)
- 예산 관리 개선: 크레딧 소진 전 사전 알림으로 계획적 사용
- 커뮤니티 공유: GitHub 오픈소스로 공개하여 동일한 문제를 겪는 사용자들에게 도움

---

## 타겟 사용자

### Primary Persona: "크리에이터 준호"
- **나이**: 28세
- **직업**: 프리랜서 영상 제작자
- **사용 서비스**: Kling AI, Google Flow, Runway, Midjourney
- **Pain Point**: 
  - 하루에 5-10개 서비스를 오가며 작업
  - 크레딧 확인을 위해 매번 로그인하는 게 번거로움
  - 프로젝트 중간에 크레딧 부족으로 작업 중단된 경험
- **니즈**: 
  - 한 곳에서 모든 크레딧 확인
  - 크레딧 소진 임박 시 알림
  - 월별 사용량 통계

### Secondary Persona: "팀 리더 서연"
- **나이**: 34세
- **직업**: 마케팅 에이전시 크리에이티브 디렉터
- **사용 서비스**: 팀원들의 여러 AI 계정 관리
- **Pain Point**:
  - 팀원별 크레딧 사용량 파악 어려움
  - 예산 초과 방지 필요
- **니즈**:
  - 팀 전체 크레딧 현황 한눈에 파악
  - 예산 추적 및 리포트

---

## 핵심 기능

### Phase 1: MVP (필수 기능)

#### 1. Chrome 확장 프로그램
- **자동 크레딧 수집**
  - Kling AI 사이트 방문 시 크레딧 정보 자동 추출
  - Google Flow 사이트 방문 시 크레딧 정보 자동 추출
  - Chrome Storage에 데이터 저장
  
- **실시간 동기화**
  - 크레딧 변동 감지 시 즉시 대시보드에 알림
  - 백그라운드에서 자동 업데이트

#### 2. Next.js 대시보드
- **서비스 카드 표시**
  - 로고, 서비스명, 잔여 크레딧 표시
  - 로고 클릭 시 해당 사이트로 이동
  - 크레딧 잔량에 따른 시각적 표시 (프로그레스 바, 색상)
  
- **크레딧 정보**
  - 전체 크레딧 (있는 경우)
  - 사용 크레딧
  - 잔여 크레딧
  - 사용률 (%)
  - 마지막 업데이트 시간

- **새로고침 기능**
  - 수동 새로고침 버튼
  - 각 서비스 탭을 백그라운드로 열어 자동 업데이트

#### 3. 데이터 관리
- **로컬 저장소**
  - Chrome Storage API 활용
  - 30일간 히스토리 저장
  
- **데이터 구조**
  ```typescript
  interface ServiceCredit {
    id: string;
    name: string;
    logoUrl: string;
    websiteUrl: string;
    credits: {
      total?: number;
      used?: number;
      remaining: number;
      resetDate?: string;
    };
    lastUpdated: string;
    history: {
      timestamp: string;
      credits: number;
    }[];
  }
  ```

### Phase 2: 개선 기능 (Nice-to-have)

#### 4. 알림 시스템
- 크레딧 부족 알림 (설정 가능한 임계값)
- 브라우저 푸시 알림
- 이메일 알림 (선택사항)

#### 5. 데이터 시각화
- 일별/주별/월별 크레딧 사용량 차트
- 서비스별 비교 차트
- 예상 소진 날짜 계산

#### 6. 서비스 관리
- 새 서비스 추가 UI
- 서비스 숨기기/표시
- 서비스 순서 변경 (드래그 앤 드롭)

---

## 기술 스택

### Frontend (Next.js Dashboard)
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: Shadcn/ui
Icons: Lucide React
Charts: Recharts
State Management: React Hooks + Chrome Storage API
Date Formatting: date-fns
Toast Notifications: Sonner
```

### Chrome Extension
```yaml
Manifest Version: V3
Language: JavaScript (ES6+)
Storage: Chrome Storage API
APIs: 
  - chrome.storage (로컬 데이터 저장)
  - chrome.tabs (탭 관리)
  - chrome.runtime (메시지 전달)
```

### Development Tools
```yaml
Package Manager: npm
Version Control: Git
Code Editor: Cursor + Claude Code
Linting: ESLint
Formatting: Prettier
Type Checking: TypeScript
```

### Deployment
```yaml
Dashboard: Vercel (무료)
Extension: Chrome Web Store (무료) 또는 로컬 설치
```

---

## 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────┐
│                   User's Chrome Browser                  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Tab: Kling   │  │Tab: Google   │  │ Tab: Others  │ │
│  │    AI        │  │    Flow      │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘ │
│         │                  │                            │
│         └──────┬───────────┘                            │
│                │                                        │
│  ┌─────────────▼────────────────────────────────────┐  │
│  │       Chrome Extension (Content Scripts)        │  │
│  │  • kling.js - Kling AI 크레딧 추출             │  │
│  │  • flow.js - Google Flow 크레딧 추출           │  │
│  │  • background.js - 백그라운드 작업             │  │
│  └─────────────┬────────────────────────────────────┘  │
│                │                                        │
│  ┌─────────────▼────────────────────────────────────┐  │
│  │           Chrome Storage API                    │  │
│  │  {                                              │  │
│  │    kling: { credits: 450, lastUpdated: ... }   │  │
│  │    flow: { credits: 850, lastUpdated: ... }    │  │
│  │  }                                              │  │
│  └─────────────┬────────────────────────────────────┘  │
│                │                                        │
└────────────────┼────────────────────────────────────────┘
                 │
                 │ (Read)
                 │
┌────────────────▼────────────────────────────────────────┐
│            Next.js Dashboard (localhost:3000)           │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Service    │  │ Service    │  │   Add      │        │
│  │ Card:      │  │ Card:      │  │  Service   │        │
│  │ Kling AI   │  │ Google Flow│  │    [+]     │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Credits History Chart                 │  │
│  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░    │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
1. 사용자가 Kling AI 방문
   ↓
2. Content Script 자동 실행
   ↓
3. DOM에서 크레딧 정보 추출
   ↓
4. Chrome Storage에 저장
   ↓
5. Storage Change Event 발생
   ↓
6. Dashboard가 변경사항 감지
   ↓
7. UI 자동 업데이트
```

---

## 사용자 스토리

### Epic 1: 크레딧 정보 수집
- **US-1.1**: 사용자로서, Kling AI에 방문하면 자동으로 크레딧이 수집되기를 원한다.
  - **AC**: Kling AI 페이지 로드 완료 시 크레딧 정보가 Chrome Storage에 저장됨
  - **AC**: 콘솔에 "✅ Kling credits updated: 450" 로그 출력

- **US-1.2**: 사용자로서, Google Flow에 방문하면 자동으로 크레딧이 수집되기를 원한다.
  - **AC**: Google Flow 페이지 로드 완료 시 크레딧 정보가 Chrome Storage에 저장됨
  - **AC**: 로그인되지 않은 경우 에러 처리

### Epic 2: 대시보드 조회
- **US-2.1**: 사용자로서, 대시보드에서 모든 서비스의 크레딧을 한눈에 보고 싶다.
  - **AC**: 대시보드에 서비스별 카드가 그리드 형태로 표시됨
  - **AC**: 각 카드에 로고, 서비스명, 크레딧 수치가 표시됨

- **US-2.2**: 사용자로서, 로고를 클릭하면 해당 서비스로 바로 이동하고 싶다.
  - **AC**: 로고 클릭 시 새 탭에서 해당 서비스 웹사이트 열림
  - **AC**: 호버 시 "클릭하여 이동" 툴팁 표시

- **US-2.3**: 사용자로서, 크레딧이 부족한 서비스를 시각적으로 알고 싶다.
  - **AC**: 크레딧 30% 이하 시 빨간색 경고 표시
  - **AC**: 프로그레스 바로 잔여율 표시

### Epic 3: 데이터 업데이트
- **US-3.1**: 사용자로서, 수동으로 크레딧 정보를 새로고침하고 싶다.
  - **AC**: 새로고침 버튼 클릭 시 모든 서비스 탭이 백그라운드로 열림
  - **AC**: 5초 후 자동으로 탭 닫힘
  - **AC**: 토스트 알림 "크레딧 정보 업데이트 완료!"

- **US-3.2**: 사용자로서, 크레딧이 변경되면 실시간으로 알림받고 싶다.
  - **AC**: Chrome Storage 변경 시 대시보드 자동 업데이트
  - **AC**: 토스트 알림 "Kling AI 크레딧 업데이트됨!"

### Epic 4: 확장성
- **US-4.1**: 개발자로서, 새로운 AI 서비스를 쉽게 추가할 수 있어야 한다.
  - **AC**: 새 content script 파일 추가만으로 서비스 추가 가능
  - **AC**: manifest.json에 URL 패턴만 추가하면 됨
  - **AC**: 대시보드에 자동으로 새 카드 표시

---

## UI/UX 요구사항

### 디자인 원칙
1. **단순성**: 복잡한 기능 없이 크레딧 정보만 명확하게
2. **직관성**: 처음 보는 사용자도 5초 안에 이해 가능
3. **반응성**: 모든 화면 크기에서 정상 작동 (데스크톱 우선)
4. **일관성**: 모든 서비스 카드가 동일한 레이아웃

### 레이아웃

#### 대시보드 메인 화면
```
┌───────────────────────────────────────────────────────────┐
│  AI Credits Dashboard                    [새로고침] [설정] │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ 🎬 Kling AI │  │ 🎥 Google   │  │    Add      │       │
│  │ 클릭하여 이동│  │    Flow     │  │   Service   │       │
│  │             │  │ 클릭하여 이동│  │     [+]     │       │
│  │ [450 크레딧]│  │ [850 크레딧]│  │             │       │
│  │             │  │             │  │             │       │
│  │ 잔여     450│  │ 잔여     850│  │             │       │
│  │ ████████░░  │  │ ████████████│  │             │       │
│  │     75%     │  │     85%     │  │             │       │
│  │             │  │             │  │             │       │
│  │ 🕐 5분 전   │  │ 🕐 10분 전  │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │           크레딧 사용 히스토리 (7일)               │   │
│  │                                                    │   │
│  │   1000 ┤                                          │   │
│  │    800 ┤     ●───●                                │   │
│  │    600 ┤   ●         ●                            │   │
│  │    400 ┤                 ●───●                    │   │
│  │    200 ┤                         ●               │   │
│  │      0 └─────────────────────────────────────────│   │
│  │        월   화   수   목   금   토   일           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 서비스 카드 상세
```
┌─────────────────────────────────┐
│  [Logo]  Kling AI    [450 크레딧]│ ← 상단: 로고 + 이름 + 뱃지
│          클릭하여 이동             │
├─────────────────────────────────┤
│  전체              600          │ ← 중단: 크레딧 상세
│  사용              150          │
│  잔여              450          │
│  ████████████████░░░░░░░  75%  │ ← 프로그레스 바
├─────────────────────────────────┤
│  🕐 5분 전                      │ ← 하단: 업데이트 시간
│  다음 리셋: 2024-01-01          │
└─────────────────────────────────┘
```

### 색상 팔레트
```css
/* Primary Colors */
--kling-blue: #3B82F6;
--flow-green: #10B981;

/* Status Colors */
--high-credits: #10B981;  /* 50% 이상 */
--medium-credits: #F59E0B; /* 20-50% */
--low-credits: #EF4444;    /* 20% 미만 */

/* Neutral Colors */
--background: #F9FAFB;
--card-background: #FFFFFF;
--text-primary: #111827;
--text-secondary: #6B7280;
--border: #E5E7EB;
```

### 인터랙션
1. **로고 호버**
   - 불투명도 80%로 감소
   - 외부 링크 아이콘 표시
   - 커서: pointer

2. **새로고침 버튼**
   - 클릭 시 아이콘 회전 애니메이션
   - 로딩 중 버튼 비활성화
   - 완료 시 토스트 알림

3. **카드 호버**
   - 그림자 증가 (shadow-lg)
   - 부드러운 전환 (transition-all)

### 반응형 디자인
```css
/* Desktop (기본) */
.grid {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet (768px 이하) */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (640px 이하) */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 기술적 요구사항

### 성능 요구사항
- **페이지 로드**: 1초 이내
- **크레딧 정보 추출**: 2초 이내
- **대시보드 업데이트**: 500ms 이내
- **메모리 사용**: 50MB 이하 (Chrome Extension)

### 보안 요구사항
- **데이터 저장**: Chrome Storage API만 사용 (외부 서버 전송 금지)
- **권한**: 필요한 최소 권한만 요청
  - `storage`: 로컬 데이터 저장
  - `tabs`: 탭 관리 (새로고침 기능용)
- **민감 정보**: 로그인 정보, 비밀번호는 절대 저장하지 않음

### 호환성 요구사항
- **Chrome 버전**: 88 이상
- **Next.js**: 14.x
- **React**: 18.x
- **TypeScript**: 5.x
- **Node.js**: 18.x 이상

### 데이터 구조 예시
```typescript
// Chrome Storage에 저장되는 데이터 구조
interface StorageData {
  services: {
    [serviceId: string]: {
      name: string;
      credits: number;
      lastUpdated: string;
      history: {
        timestamp: string;
        credits: number;
      }[];
    };
  };
  settings: {
    notifications: boolean;
    lowCreditThreshold: number;
    refreshInterval: number;
  };
}

// 예시
{
  "services": {
    "kling": {
      "name": "Kling AI",
      "credits": 450,
      "lastUpdated": "2024-12-05T10:30:00Z",
      "history": [
        { "timestamp": "2024-12-05T10:30:00Z", "credits": 450 },
        { "timestamp": "2024-12-05T09:00:00Z", "credits": 500 }
      ]
    },
    "flow": {
      "name": "Google Flow",
      "credits": 850,
      "lastUpdated": "2024-12-05T10:25:00Z",
      "history": [
        { "timestamp": "2024-12-05T10:25:00Z", "credits": 850 }
      ]
    }
  },
  "settings": {
    "notifications": true,
    "lowCreditThreshold": 100,
    "refreshInterval": 300000
  }
}
```

### 에러 처리
```typescript
// 에러 처리 전략

// 1. Content Script 에러
try {
  const credits = extractCredits();
  chrome.storage.local.set({ kling: credits });
} catch (error) {
  console.error('[Kling] 크레딧 추출 실패:', error);
  // 사용자에게 알리지 않음 (조용히 실패)
}

// 2. Storage 에러
chrome.storage.local.get(['services'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('Storage 읽기 실패:', chrome.runtime.lastError);
    // Fallback: localStorage 사용
  }
});

// 3. Dashboard 에러
try {
  const data = await getChromeStorage();
  setCredits(data);
} catch (error) {
  toast.error('크레딧 정보를 불러올 수 없습니다');
  // Fallback: 캐시된 데이터 표시
}
```

---

## 성공 지표

### 정량적 지표
1. **시간 절감**
   - 목표: 크레딧 확인 시간 90% 감소 (10분 → 1분)
   - 측정: 사용자 설문

2. **자동화율**
   - 목표: 95% 이상 자동 수집 성공률
   - 측정: Chrome Storage 업데이트 성공 로그

3. **사용 빈도**
   - 목표: 주 3회 이상 대시보드 조회
   - 측정: Google Analytics

4. **확장성**
   - 목표: 새 서비스 추가 시 30분 이내 개발 완료
   - 측정: 개발 시간 기록

### 정성적 지표
1. **사용자 만족도**
   - 목표: NPS 점수 8점 이상
   - 측정: 사용자 피드백

2. **UI/UX**
   - 목표: "직관적이다" 90% 이상
   - 측정: 사용성 테스트

3. **안정성**
   - 목표: 주요 버그 0건
   - 측정: GitHub Issues

---

## 개발 마일스톤

### Week 1: 기본 인프라 구축
**Day 1-2: 프로젝트 셋업**
- [ ] Next.js 프로젝트 생성
- [ ] Chrome Extension 폴더 구조 생성
- [ ] Tailwind CSS, Shadcn/ui 설치
- [ ] TypeScript 설정
- [ ] Git 저장소 초기화

**Day 3-4: Chrome Extension 개발**
- [ ] Manifest.json 작성
- [ ] Kling AI content script 개발
- [ ] Google Flow content script 개발
- [ ] Chrome Storage API 연동
- [ ] 로컬 테스트

**Day 5-7: Dashboard 개발**
- [ ] 레이아웃 컴포넌트 작성
- [ ] ServiceCard 컴포넌트 개발
- [ ] Chrome Storage 읽기 구현
- [ ] 실시간 동기화 구현

### Week 2: 기능 완성 및 테스트
**Day 8-10: 핵심 기능 개발**
- [ ] 새로고침 버튼 구현
- [ ] 프로그레스 바 및 상태 표시
- [ ] 로고 클릭 → 사이트 이동
- [ ] 에러 처리

**Day 11-12: 테스트 및 버그 수정**
- [ ] 수동 테스트 (각 서비스별)
- [ ] 엣지 케이스 테스트
- [ ] 버그 수정
- [ ] 성능 최적화

**Day 13-14: 문서화 및 배포**
- [ ] README.md 작성
- [ ] 사용자 가이드 작성
- [ ] 스크린샷/데모 영상 제작
- [ ] GitHub 공개

### Week 3+: 추가 기능 및 개선
- [ ] 히스토리 차트 구현
- [ ] 알림 시스템 추가
- [ ] 새 서비스 추가 (Midjourney, Runway 등)
- [ ] 사용자 피드백 반영

---

## 향후 확장 계획

### Phase 2: 추가 서비스 지원
- [ ] Midjourney
- [ ] Runway
- [ ] Stable Diffusion (DreamStudio)
- [ ] Leonardo.ai
- [ ] Pika Labs

### Phase 3: 고급 기능
- [ ] 크레딧 사용 패턴 분석
- [ ] 예산 관리 기능
- [ ] CSV 내보내기
- [ ] 팀 협업 기능 (다중 계정 관리)
- [ ] 모바일 앱 (React Native)

### Phase 4: 커뮤니티 기능
- [ ] 오픈소스 공개
- [ ] 커뮤니티 프리셋 공유
- [ ] 플러그인 시스템
- [ ] 마켓플레이스

### Phase 5: 수익화 (선택사항)
- [ ] 프리미엄 기능 (고급 통계, 무제한 히스토리)
- [ ] 팀 플랜
- [ ] API 제공

---

## 리스크 및 대응 방안

### 기술적 리스크

| 리스크 | 가능성 | 영향 | 대응 방안 |
|--------|--------|------|-----------|
| **사이트 구조 변경** | 높음 | 높음 | • 여러 선택자 시도<br>• 정규식 패턴 매칭<br>• 빠른 업데이트 프로세스 |
| **Chrome Extension 정책 변경** | 낮음 | 높음 | • Manifest V3 준수<br>• 최소 권한 원칙<br>• 정기적 정책 확인 |
| **크레딧 정보 추출 실패** | 중간 | 중간 | • Try-catch 처리<br>• Fallback 로직<br>• 사용자 피드백 수집 |

### 사용자 경험 리스크

| 리스크 | 가능성 | 영향 | 대응 방안 |
|--------|--------|------|-----------|
| **확장 프로그램 미설치** | 높음 | 높음 | • 명확한 설치 가이드<br>• 비디오 튜토리얼<br>• 대시보드에서 설치 안내 |
| **복잡한 설정** | 낮음 | 중간 | • Zero-config 지향<br>• 기본값 제공 |

### 법적/윤리적 리스크

| 리스크 | 가능성 | 영향 | 대응 방안 |
|--------|--------|------|-----------|
| **서비스 약관 위반 의심** | 낮음 | 중간 | • 사용자 브라우저에서만 동작<br>• 서버 전송 없음<br>• 개인 사용 목적 명시 |
| **데이터 프라이버시** | 낮음 | 높음 | • 로컬 저장만 사용<br>• 민감 정보 미수집<br>• 개인정보 처리방침 작성 |

---

## 부록

### A. 용어 정리
- **크레딧**: AI 서비스 사용을 위한 가상 화폐
- **Content Script**: 웹 페이지에 주입되는 JavaScript 코드
- **Chrome Storage**: Chrome 확장 프로그램의 로컬 저장소
- **MVP**: Minimum Viable Product (최소 기능 제품)

### B. 참고 자료
- [Chrome Extension 개발 가이드](https://developer.chrome.com/docs/extensions/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Shadcn/ui 컴포넌트](https://ui.shadcn.com/)

### C. 연락처
- **프로젝트 관리자**: [이름]
- **GitHub**: [저장소 URL]
- **이메일**: [이메일 주소]

---

**문서 버전 히스토리**
- v1.0 (2024-12-05): 초안 작성