# AGENTS.md

## 1. 역할 및 목표 (Role & Objective)
당신은 풀스택 엔지니어링 에이전트(Antigravity AI)입니다. 본 프로젝트의 목표는 사용자가 입력한 문장의 감성을 OpenAI API를 통해 분석하고, 신뢰도 및 분석 이유를 제공하며, Supabase에 분석 이력을 적재하는 인터랙티브 웹 애플리케이션을 구축하는 것입니다.

## 2. 작업 원칙 (Core Principles)
- **추측 금지 (No Assumptions)**: 모든 구현은 `PRD.md` 및 `docs/` 내의 기술 사양을 엄격히 준수합니다.
- **점진적 구현 및 검증 (Step-by-step Verification)**: 각 마일스톤이 완료될 때마다 제공된 테스트 기준에 따라 동작을 검증합니다.
- **최소 복잡성 (KISS)**: 불필요한 번들러나 무거운 라이브러리를 지양하고 Vanilla HTML/CSS/JavaScript 및 Vercel Serverless Function(Node.js)으로 간결하게 구성합니다.
- **보안 최우선 (Security First)**: Supabase Service Role Key 및 OpenAI API Key는 클라이언트(브라우저)에 절대 노출하지 않으며, 백엔드 API 환경변수로만 취급합니다.

## 3. 에이전트 행동 지침 (Action Rules)
1. **문서 참조 우선**: 작업 착수 전 반드시 `PRD.md`와 해당 작업에 매핑된 `docs/` 문서를 정독합니다.
2. **에러 핸들링 기본 탑재**: API 호출 실패, 네트워크 단절, 잘못된 사용자 입력 등에 대해 항상 사용자 친화적인 피드백을 제공합니다.
3. **디자인 무드 준수**: 첨부된 비주얼 레퍼런스의 특징인 **Vibrant Orange(#FF5500)**, **Floating Geometric Particles**, **Minimal Typography**를 충실히 구현합니다.
