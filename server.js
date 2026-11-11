// ==============================================================================
// server.js
// Weekends Sentiment Lab - 로컬 개발 및 테스트용 Node.js 서버
// ==============================================================================
// 설명: 별도의 복잡한 도구 설치 없이 'node server.js' 명령 하나로 
//       프론트엔드 정적 웹 페이지와 백엔드 API(/api/analyze)를 동시에 로컬에서 실행합니다.
// ==============================================================================

import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiHandler from './api/analyze.js';

// 현재 파일의 디렉토리 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// 확장자별 MIME 타입 정의
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// HTTP 서버 인스턴스 생성
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

  // 1. API 요청 라우팅: /api/analyze
  if (pathname === '/api/analyze') {
    // POST 요청 바디 파싱을 위한 버퍼 수집
    let bodyData = '';
    req.on('data', (chunk) => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      try {
        if (bodyData) {
          req.body = JSON.parse(bodyData);
        } else {
          req.body = {};
        }
      } catch (err) {
        req.body = {};
      }

      // Vercel Serverless Function 형태의 res 헬퍼(status, json, setHeader) 래핑
      res.status = function (code) {
        this.statusCode = code;
        return this;
      };

      res.json = function (data) {
        this.setHeader('Content-Type', 'application/json; charset=utf-8');
        this.end(JSON.stringify(data));
        return this;
      };

      // api/analyze.js 핸들러 실행
      try {
        await apiHandler(req, res);
      } catch (err) {
        console.error('API 핸들러 에러:', err);
        if (!res.writableEnded) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }));
        }
      }
    });
    return;
  }

  // 2. 프론트엔드 정적 파일 서빙 (public 폴더)
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, relativePath);

  // 디렉토리 트래버설 공격 방지 (보안 검사)
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: 접근이 거부되었습니다.');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 파일을 찾을 수 없는 경우 index.html 반환 (SPA 기본 라우팅)
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// 서버 실행 및 대기
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Weekends Sentiment Lab 서버가 성공적으로 실행되었습니다!`);
  console.log(`👉 브라우저 주소: http://localhost:${PORT}`);
  console.log(`   종료하려면 터미널에서 Ctrl + C 를 누르세요.`);
  console.log('====================================================');
});

