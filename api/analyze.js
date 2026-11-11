// ==============================================================================
// api/analyze.js
// 설명: Vercel Serverless Function - 감성 분석 처리 및 Supabase DB 저장
// ==============================================================================

// 1. 환경 변수 로드 (.env 파일에서 API 키와 DB 주소를 읽어옵니다)
import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 2. OpenAI 클라이언트 초기화
// API 키가 설정되어 있지 않으면 경고를 출력하고 요청 처리 시 에러를 반환합니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 3. Supabase 관리자 클라이언트 초기화 (Service Role Key 사용)
// 서버사이드에서만 실행되므로 비공개 관리자 키를 안전하게 사용하여 RLS를 통과합니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
}

// 4. Serverless Function 핸들러 (HTTP 요청 수신 시 실행되는 메인 함수)
export default async function handler(req, res) {
  // CORS 헤더 설정 (브라우저와의 통신 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 사전 요청(Preflight) 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 메서드만 허용합니다
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: '허용되지 않는 메서드입니다. POST 요청만 지원합니다.',
    });
  }

  try {
    // 5. 요청 데이터 추출 및 유효성 검사
    const { text } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length < 2) {
      return res.status(400).json({
        error: '분석할 텍스트를 최소 2자 이상 입력해주세요.',
      });
    }

    const trimmedText = text.trim();

    // 6. 환경 변수 유효성 확인
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: '서버에 OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.',
      });
    }

    // 7. OpenAI API (gpt-4o-mini) 호출 - 감성 분석 수행
    const systemPrompt = `You are a sentiment analysis engine. Analyze the given text and respond strictly in JSON with keys:
- "sentiment": "positive" | "negative" | "neutral"
- "confidence": integer between 0 and 100
- "reason": brief 1-2 sentence explanation in Korean`;

    const userPrompt = `다음 텍스트의 감성을 분석해주세요:\n"${trimmedText}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    // 8. 응답 JSON 파싱
    const rawResult = completion.choices[0]?.message?.content;
    if (!rawResult) {
      throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
    }

    const parsed = JSON.parse(rawResult);

    // 감성 값 정규화 및 기본값 보정
    let sentiment = (parsed.sentiment || 'neutral').toLowerCase();
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
      sentiment = 'neutral';
    }

    let confidence = parseInt(parsed.confidence, 10);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      confidence = 50;
    }

    const reason = parsed.reason || '입력된 문맥을 바탕으로 감성을 판별했습니다.';
    const createdAt = new Date().toISOString();

    // 9. Supabase DB (sentiment_logs 테이블)에 비동기 이력 적재
    if (supabase) {
      const { error: dbError } = await supabase.from('sentiment_logs').insert([
        {
          input_text: trimmedText,
          sentiment: sentiment,
          confidence: confidence,
          reason: reason,
          created_at: createdAt,
        },
      ]);

      if (dbError) {
        // DB 저장 실패 시 콘솔에 로그만 남기고, 사용자 분석 결과 응답은 정상 전달합니다
        console.error('Supabase DB 저장 중 오류 발생:', dbError.message);
      } else {
        console.log('Supabase DB에 분석 이력이 성공적으로 저장되었습니다.');
      }
    } else {
      console.warn('Supabase 설정이 없어 DB 저장을 건너뜁니다.');
    }

    // 10. 최종 성공 응답 반환 (PRD 명세 형식 준수)
    return res.status(200).json({
      sentiment: sentiment,
      confidence: confidence,
      reason: reason,
      created_at: createdAt,
    });
  } catch (error) {
    console.error('API /api/analyze 실행 에러:', error);
    return res.status(500).json({
      error: error.message || '감성 분석 처리 중 일시적인 오류가 발생했습니다.',
    });
  }
}

