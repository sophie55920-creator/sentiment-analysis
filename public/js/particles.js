// ==============================================================================
// public/js/particles.js
// Weekends Sentiment Lab - 캔버스 기하학 파티클 부유 애니메이션
// ==============================================================================

(function () {
  'use strict';

  // 1. 캔버스 및 그래픽 컨텍스트(2D) 가져오기
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // 화면 크기 및 마우스 인터랙션 좌표 저장 변수
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // 마우스 위치 (패럴랙스 효과를 위한 완만한 보간 목표값)
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
  };

  // 2. 화면 리사이즈 시 캔버스 해상도 자동 동기화
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 3. 마우스 이동 감지 (화면 움직임 효과)
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // 4. 기하학 도형(파티클) 클래스 정의
  // 원, 별모양 다각형, 둥근 모서리 사각형, 삼각형 등의 다양한 형태를 지원합니다.
  const SHAPES = ['circle', 'triangle', 'roundedRect', 'star'];

  class FloatingShape {
    constructor() {
      this.reset(true);
    }

    // 파티클 초기화 (화면 전체에 균일하게 배치하거나 상단/하단에서 재생성)
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 50;

      // 크기 및 형태 무작위 선택
      this.size = Math.random() * 22 + 12; // 12px ~ 34px
      this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

      // 속도 (천천히 위로 떠오르는 부유 모션)
      this.vy = -(Math.random() * 0.4 + 0.2); // 위쪽 방향
      this.vx = (Math.random() - 0.5) * 0.3;  // 좌우 완만한 흔들림

      // 회전 각도 및 회전 속도
      this.angle = Math.random() * Math.PI * 2;
      this.vAngle = (Math.random() - 0.5) * 0.015;

      // 투명도 (화이트 글래스 느낌: 0.15 ~ 0.45)
      this.alpha = Math.random() * 0.3 + 0.15;

      // 패럴랙스 반응 계수 (도형마다 마우스에 반응하는 깊이감 차등 부여)
      this.depth = Math.random() * 0.03 + 0.01;
    }

    // 위치 갱신
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.vAngle;

      // 화면 위쪽으로 완전히 벗어나면 다시 아래쪽에서 등장
      if (this.y < -50 || this.x < -50 || this.x > width + 50) {
        this.reset(false);
      }
    }

    // 화면에 그리기
    draw(parallaxX, parallaxY) {
      ctx.save();
      
      // 마우스 움직임에 따른 패럴랙스 위치 오프셋 적용
      const drawX = this.x + parallaxX * this.depth;
      const drawY = this.y + parallaxY * this.depth;

      ctx.translate(drawX, drawY);
      ctx.rotate(this.angle);

      // 반투명 순백색 스타일
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha + 0.15})`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();

      switch (this.shape) {
        case 'circle':
          // 원형 도형
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'triangle':
          // 정삼각형 도형
          const r = this.size / 2;
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.866, r * 0.5);
          ctx.lineTo(-r * 0.866, r * 0.5);
          ctx.closePath();
          ctx.fill();
          break;

        case 'roundedRect':
          // 둥근 모서리 사각형 도형
          const w = this.size;
          const h = this.size * 0.85;
          const radius = 6;
          ctx.roundRect(-w / 2, -h / 2, w, h, radius);
          ctx.fill();
          ctx.stroke();
          break;

        case 'star':
          // 4각형 별모양 (십자형태의 다이아몬드 별)
          const s = this.size * 0.6;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  }

  // 5. 파티클 컬렉션 생성 (화면 해상도에 맞춰 적절한 개수 조절)
  const particleCount = Math.min(Math.floor((width * height) / 25000), 45);
  const particles = Array.from({ length: particleCount }, () => new FloatingShape());

  // 6. 메인 렌더 루프 (requestAnimationFrame)
  function animate() {
    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 마우스 보간 (부드러운 카메라 패럴랙스 느낌 구현)
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const parallaxX = (mouse.x - width / 2);
    const parallaxY = (mouse.y - height / 2);

    // 모든 파티클 갱신 및 렌더링
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(parallaxX, parallaxY);
    }

    requestAnimationFrame(animate);
  }

  // 애니메이션 루프 시작
  animate();
})();

