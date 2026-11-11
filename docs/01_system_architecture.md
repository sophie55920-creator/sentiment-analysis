# 01. 시스템 아키텍처 및 디렉토리 구조

## 1. 아키텍처 다이어그램
```text
[Browser (HTML/CSS/JS)] 
       │
       ▼ (POST /api/analyze)
[Vercel Serverless Function (Node.js)]
       ├───► [OpenAI API (gpt-4o-mini)] : 감성 분석 및 JSON 추출
       └───► [Supabase DB] : 분석 로그 저장 (PostgreSQL)
```

## 2. 디렉토리 구조
```text
project-root/
├── public/
│   ├── index.html        # 메인 웹 페이지
│   ├── css/
│   │   └── style.css     # 오렌지 테마 및 스타일링
│   ├── js/
│   │   ├── app.js        # UI 인터랙션 및 API 호출
│   │   └── particles.js  # 캔버스 파티클 애니메이션
│   └── assets/           # 아이콘 및 로고
├── api/
│   └── analyze.js        # Vercel Serverless Node.js 엔드포인트
├── docs/
│   ├── 01_system_architecture.md
│   ├── 02_ui_ux_design.md
│   ├── 03_frontend_implementation.md
│   ├── 04_backend_api.md
│   ├── 05_database_supabase.md
│   └── 06_deployment_and_verification.md
├── .env.example
├── AGENTS.md
├── PRD.md
├── package.json
└── vercel.json
```
