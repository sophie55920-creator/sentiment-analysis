// ==============================================================================
// public/js/app.js
// Weekends Sentiment Lab - 프론트엔드 UI 인터랙션 및 API 통신 로직
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. 주요 DOM 엘리먼트 참조 가져오기
  const sentimentForm = document.getElementById('sentiment-form');
  const textInput = document.getElementById('text-input');
  const charCount = document.getElementById('char-count');
  const analyzeBtn = document.getElementById('analyze-btn');

  // 오류/알림 배너
  const alertBanner = document.getElementById('alert-banner');
  const alertMessage = document.getElementById('alert-message');

  // 분석 결과 영역 엘리먼트
  const resultCard = document.getElementById('result-card');
  const sentimentBadge = document.getElementById('sentiment-badge');
  const confidencePercent = document.getElementById('confidence-percent');
  const confidenceBar = document.getElementById('confidence-bar');
  const reasoningText = document.getElementById('reasoning-text');
  const timestampText = document.getElementById('timestamp-text');
  const resetBtn = document.getElementById('reset-btn');

  // 상단 스크롤 버튼
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  // 2. 글자 수 실시간 카운팅 이벤트
  textInput.addEventListener('input', () => {
    const currentLength = textInput.value.length;
    charCount.textContent = currentLength;

    // 입력 중에는 에러 배너를 부드럽게 숨김
    if (alertBanner.style.display !== 'none') {
      hideAlert();
    }
  });

  // 3. 단축키(Ctrl + Enter 또는 Cmd + Enter)로 빠른 분석 지원
  textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      sentimentForm.requestSubmit();
    }
  });

  // 4. 폼 제출(Submit) 이벤트 리스너
  sentimentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = textInput.value.trim();

    // 유효성 검사 1: 공백 입력 차단 및 최소 2자 검증
    if (!text || text.length < 2) {
      showAlert('분석할 문장을 최소 2자 이상 입력해주세요.');
      textInput.focus();
      return;
    }

    // 분석 처리 시작 (로딩 상태 돌입)
    setLoading(true);
    hideAlert();

    try {
      // 5. 백엔드 API (/api/analyze) 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      const data = await response.json();

      // 응답 실패(4xx, 5xx 에러)인 경우
      if (!response.ok) {
        throw new Error(data.error || '감성 분석 서버와의 통신에 실패했습니다.');
      }

      // 6. 성공적인 결과 렌더링
      renderResult(data);
    } catch (error) {
      console.error('분석 요청 에러:', error);
      showAlert(error.message || '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      // 로딩 상태 해제
      setLoading(false);
    }
  });

  // 7. 분석 결과 화면 렌더링 함수
  function renderResult(data) {
    const { sentiment, confidence, reason, created_at } = data;

    // 감성 라벨 매핑 및 스타일 적용
    sentimentBadge.className = 'sentiment-badge'; // 기존 클래스 초기화
    let labelKorean = '중립 (Neutral)';

    if (sentiment === 'positive') {
      sentimentBadge.classList.add('positive');
      labelKorean = '긍정 (Positive)';
    } else if (sentiment === 'negative') {
      sentimentBadge.classList.add('negative');
      labelKorean = '부정 (Negative)';
    } else {
      sentimentBadge.classList.add('neutral');
      labelKorean = '중립 (Neutral)';
    }

    sentimentBadge.textContent = labelKorean;

    // 신뢰도 퍼센트 및 바 업데이트
    const validConfidence = Math.min(Math.max(confidence || 0, 0), 100);
    confidencePercent.textContent = `${validConfidence}%`;
    confidenceBar.style.width = '0%'; // 애니메이션 시작 전 초기화
    
    // 부드러운 프로그레스 바 애니메이션을 위한 약간의 지연
    setTimeout(() => {
      confidenceBar.style.width = `${validConfidence}%`;
    }, 50);

    // 분석 이유 텍스트 설정
    reasoningText.textContent = reason || '문맥을 기반으로 도출된 감성 분석 결과입니다.';

    // 일시 표시 (한국 로컬 시간으로 포맷팅)
    if (created_at) {
      const date = new Date(created_at);
      timestampText.textContent = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      timestampText.textContent = new Date().toLocaleString('ko-KR');
    }

    // 결과 카드 보이기
    resultCard.style.display = 'block';

    // 결과 카드 위치로 부드럽게 스크롤
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 8. 새 문장 분석하기 (초기화)
  resetBtn.addEventListener('click', () => {
    textInput.value = '';
    charCount.textContent = '0';
    resultCard.style.display = 'none';
    hideAlert();
    textInput.focus();
  });

  // 9. 로딩 상태 전환 함수
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeBtn.disabled = true;
      analyzeBtn.classList.add('loading');
      textInput.disabled = true;
    } else {
      analyzeBtn.disabled = false;
      analyzeBtn.classList.remove('loading');
      textInput.disabled = false;
    }
  }

  // 10. 알림/오류 메시지 표시 및 숨김 함수
  function showAlert(message) {
    alertMessage.textContent = message;
    alertBanner.style.display = 'flex';
  }

  function hideAlert() {
    alertBanner.style.display = 'none';
  }

  // 11. 상단 스크롤 버튼 기능
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
});

