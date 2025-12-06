# AI Credits Dashboard - Chrome/Whale 확장 프로그램

여러 AI 이미지/영상 생성 서비스의 잔여 크레딧을 한눈에 확인할 수 있는 브라우저 확장 프로그램입니다.

## 지원 서비스
- Kling AI (klingai.com)
- Google Flow (labs.google)

## 설치 방법

### Chrome 브라우저
1. Chrome 브라우저에서 `chrome://extensions` 접속
2. 우측 상단의 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. `extension` 폴더 선택
5. 설치 완료!

### Whale 브라우저 (네이버 웨일)
1. Whale 브라우저에서 `whale://extensions` 접속
2. 우측 상단의 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. `extension` 폴더 선택
5. 설치 완료!

## 사용 방법

### 크레딧 자동 수집
1. 확장 프로그램 설치 후 Kling AI 또는 Google Flow 사이트 방문
2. 로그인된 상태에서 크레딧 정보가 자동으로 수집됩니다
3. 브라우저 우측 상단의 확장 프로그램 아이콘 클릭하여 대시보드 확인

### 수동 새로고침
- 팝업 창 우측 상단의 새로고침 버튼 클릭
- 모든 서비스 탭이 백그라운드에서 열려 크레딧 정보 갱신
- 5초 후 자동으로 탭 닫힘

## 파일 구조

```
extension/
├── manifest.json          # 확장 프로그램 설정
├── popup.html             # 팝업 UI
├── popup.css              # 팝업 스타일
├── popup.js               # 팝업 로직
├── background.js          # 백그라운드 서비스
├── content-scripts/
│   ├── kling.js           # Kling AI 크레딧 추출
│   └── flow.js            # Google Flow 크레딧 추출
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 새로운 서비스 추가하기

1. `content-scripts/` 폴더에 새 서비스용 스크립트 추가
2. `manifest.json`의 `content_scripts` 배열에 URL 패턴 추가
3. `popup.js`의 `SERVICES` 객체에 서비스 정보 추가

### 예시: Midjourney 추가

```javascript
// content-scripts/midjourney.js
// ... (kling.js 참고하여 작성)

// manifest.json에 추가
{
  "matches": ["https://www.midjourney.com/*"],
  "js": ["content-scripts/midjourney.js"],
  "run_at": "document_idle"
}

// popup.js SERVICES에 추가
midjourney: {
  id: 'midjourney',
  name: 'Midjourney',
  url: 'https://www.midjourney.com',
  color: 'midjourney'
}
```

## 데이터 저장

- 모든 데이터는 브라우저 로컬 저장소(Chrome Storage)에 저장
- 외부 서버로 데이터 전송 없음
- 30일간의 크레딧 히스토리 저장

## 권한 설명

| 권한 | 용도 |
|------|------|
| `storage` | 크레딧 데이터 로컬 저장 |
| `tabs` | 새로고침 시 탭 관리 |
| `host_permissions` | 지원 서비스 웹사이트에서 크레딧 정보 추출 |

## 문제 해결

### 크레딧이 표시되지 않는 경우
1. 해당 서비스에 로그인되어 있는지 확인
2. 서비스 웹사이트 직접 방문 후 팝업 다시 열기
3. 새로고침 버튼 클릭

### 확장 프로그램이 작동하지 않는 경우
1. `chrome://extensions`에서 확장 프로그램이 활성화되어 있는지 확인
2. 오류 발생 시 "오류" 버튼을 클릭하여 로그 확인
3. 확장 프로그램을 제거 후 다시 설치

## 라이선스

MIT License
