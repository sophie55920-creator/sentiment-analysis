# 04. 백엔드 API 명세 (Vercel Serverless)

## 1. 엔드포인트: `POST /api/analyze`

### Request Body (JSON)
```json
{
  "text": "오늘 프로젝트가 잘 마무리되어서 너무 뿌듯하고 기뻐요!"
}
```

### Response Body (JSON - Success 200)
```json
{
  "sentiment": "positive",
  "confidence": 98,
  "reason": "목표 달성과 완성에 대한 강한 성취감과 기쁨의 감정이 뚜렷하게 드러남",
  "created_at": "2026-11-10T03:30:00Z"
}
```

### Response Body (Error 400 / 500)
```json
{
  "error": "분석할 텍스트를 입력해주세요."
}
```

## 2. OpenAI 프롬프트 엔지니어링
- **Model**: `gpt-4o-mini`
- **Response Format**: `json_object`
- **System Prompt**:
  > You are a sentiment analysis engine. Analyze the given text and respond strictly in JSON with keys:
  > - "sentiment": "positive" | "negative" | "neutral"
  > - "confidence": integer between 0 and 100
  > - "reason": brief 1-2 sentence explanation in Korean
