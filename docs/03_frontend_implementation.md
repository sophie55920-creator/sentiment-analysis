# 03. 프론트엔드 구현 사양서

## 1. HTML (`public/index.html`) 구성
- 시맨틱 마크업 (`<header>`, `<main>`, `<section>`, `<footer>`)
- 배경 캔버스 (`<canvas id="particle-canvas">`)
- 입력 폼: `<textarea id="text-input" placeholder="어떤 기분이나 생각을 적어보세요..."></textarea>`
- 분석 버튼: `<button id="analyze-btn">감성 분석하기</button>`
- 로딩 스피너 및 에러 메시지 컨테이너
- 결과 카드 컴포넌트:
  - 감성 태그 badge (`#sentiment-badge`)
  - 신뢰도 프로그레스 바 (`#confidence-meter`)
  - 이유 텍스트 (`#reasoning-text`)

## 2. CSS (`public/css/style.css`) 사양
- CSS Grid 및 Flexbox를 활용한 반응형 중앙 정렬
- Glassmorphism 효과:
  ```css
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  ```
- CSS Keyframes를 통한 결과 카드 슬라이드업 & 페이드인 효과

## 3. JavaScript (`public/js/app.js`) 로직
- 입력값 유효성 검사 (공백 제외 2자 이상)
- fetch API를 사용한 `/api/analyze` 호출
- 로딩 상태 처리 (버튼 비활성화, 스피너 표시)
- 응답 데이터 화면 렌더링 및 에러 상태 렌더링
