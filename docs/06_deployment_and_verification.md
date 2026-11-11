# 06. 배포 및 검증 체크리스트

## 1. 환경 변수 설정 (Vercel Project Settings)
- `OPENAI_API_KEY`: OpenAI API Secret Key
- `SUPABASE_URL`: Supabase 프로젝트 URL (예: `https://xyz.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Secret Key

## 2. 단계별 검증 체크리스트
| 단계 | 검증 항목 | 기대 결과 |
| :--- | :--- | :--- |
| **UI** | 배경 파티클 애니메이션 | 도형들이 부드럽게 화면을 부유하며 마우스 반응 동작 |
| **입력** | 빈 입력창 제출 시도 | 알림 메시지 노출 및 API 호출 차단 |
| **분석** | 긍정 텍스트 입력 | 긍정 라벨(녹색 뱃지), 높은 신뢰도(%), 타당한 이유 표시 |
| **분석** | 부정 텍스트 입력 | 부정 라벨(붉은색 뱃지), 높은 신뢰도(%), 타당한 이유 표시 |
| **DB** | 분석 완료 후 Supabase 확인 | `sentiment_logs` 테이블에 새로운 레코드 생성 확인 |
| **오류** | API 키 누락/잘못된 통신 | 화면에 "일시적인 오류가 발생했습니다" 에러 카드 노출 |
