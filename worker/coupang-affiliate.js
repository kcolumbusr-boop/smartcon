// ==================================================================
// SmartCon — Coupang Partners Deeplink Worker
// ------------------------------------------------------------------
// Cloudflare Workers · 환경변수에 COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY
// 클라이언트가 검색 URL을 보내면 HMAC 서명 후 쿠팡 파트너스 Deeplink API
// 를 호출하여 추적용 단축 URL을 받아 반환합니다.
//
// 배포: docs/CLOUDFLARE_WORKERS_SETUP.md 참조
// ==================================================================

const COUPANG_HOST = 'api-gateway.coupang.com';
const DEEPLINK_PATH = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';

// CORS 허용 origin (앱 도메인만 — 추가 시 여기에 명시)
const ALLOWED_ORIGINS = [
  'https://kcolumbusr-boop.github.io',
  'http://localhost:8765'   // 로컬 개발 서버 (선택)
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

// HMAC-SHA256 → hex
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// yyMMddTHHmmssZ (GMT)
function gmtSignedDate(d) {
  d = d || new Date();
  const pad = n => String(n).padStart(2, '0');
  return (
    String(d.getUTCFullYear()).slice(-2) +
    pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'
  );
}

async function buildAuthHeader({ method, path, query, accessKey, secretKey }) {
  const datetime = gmtSignedDate();
  const message = datetime + method + path + (query || '');
  const signature = await hmacSha256Hex(secretKey, message);
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

async function callCoupangDeeplink({ urls, accessKey, secretKey }) {
  const body = JSON.stringify({ coupangUrls: urls });
  const authorization = await buildAuthHeader({
    method: 'POST', path: DEEPLINK_PATH, query: '', accessKey, secretKey
  });
  const res = await fetch('https://' + COUPANG_HOST + DEEPLINK_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorization
    },
    body
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, error: text.substring(0, 200) };
  }
  try {
    const data = JSON.parse(text);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, status: 500, error: 'JSON parse fail: ' + text.substring(0, 200) };
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'POST only' }), {
        status: 405, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // 환경변수 검증
    const accessKey = env.COUPANG_ACCESS_KEY;
    const secretKey = env.COUPANG_SECRET_KEY;
    if (!accessKey || !secretKey) {
      return new Response(JSON.stringify({ ok: false, error: 'Server keys not configured' }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // 클라이언트가 보내는 형식:
    // { urls: ["https://www.coupang.com/np/search?q=..."] }  또는
    // { query: "딸기" }   (검색어만 보내면 worker가 검색 URL 생성)
    let urls = [];
    if (Array.isArray(body.urls)) {
      urls = body.urls.filter(u => typeof u === 'string' && u.includes('coupang.com')).slice(0, 20);
    } else if (typeof body.query === 'string' && body.query.trim()) {
      const q = encodeURIComponent(body.query.trim());
      urls = [`https://www.coupang.com/np/search?q=${q}&channel=user`];
    }
    if (urls.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'urls or query required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const result = await callCoupangDeeplink({ urls, accessKey, secretKey });
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : (result.status || 500),
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
};
