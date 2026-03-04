/**
 * 토스 OAuth 인증 유틸
 * 콘솔 앱 등록 후 CLIENT_ID, REDIRECT_URI만 채우면 바로 동작
 *
 * [mTLS 백엔드 구현 가이드]
 * - mTLS 인증서는 서버-서버 전용이므로 클라이언트에서 직접 auth.toss.im 호출 불가
 * - 백엔드 /api/auth/token 엔드포인트 구현 시:
 *   1. 클라이언트로부터 authorization code를 받음
 *   2. mTLS 인증서를 사용하여 auth.toss.im/oauth2/token 으로 토큰 교환 요청
 *   3. 발급받은 access_token, user_key 등을 클라이언트에 반환
 * - 인증서 파일: 앱인토스 콘솔에서 다운로드한 mTLS 인증서(.pem) 사용
 */

// TODO: 앱인토스 콘솔에서 발급받은 값으로 교체
const AUTH_CONFIG = {
  CLIENT_ID: '',
  REDIRECT_URI: `${window.location.origin}/`,
  AUTH_URL: 'https://auth.toss.im/oauth2/authorize',
  // mTLS는 서버-서버 전용 → 토큰 교환은 백엔드 프록시 경유
  TOKEN_URL: '/api/auth/token',
} as const;

const STORAGE_KEY = 'invest-like-me:auth';

export interface AuthUser {
  accessToken: string;
  userKey: string;
  nickname?: string;
}

function getStoredAuth(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setStoredAuth(user: AuthUser): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearStoredAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * 토스 OAuth 로그인 페이지로 이동
 */
function login(): void {
  if (!AUTH_CONFIG.CLIENT_ID) {
    console.warn('[Auth] CLIENT_ID가 설정되지 않았어요. 콘솔 앱 등록 후 설정해주세요.');
    return;
  }

  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.CLIENT_ID,
    redirect_uri: AUTH_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: 'user:profile',
  });

  window.location.href = `${AUTH_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * OAuth 콜백 처리 (authorization code → 백엔드 프록시 → access token)
 * 클라이언트는 /api/auth/token만 호출하고, 백엔드에서 mTLS로 auth.toss.im 호출
 */
async function handleCallback(code: string): Promise<AuthUser | null> {
  if (!AUTH_CONFIG.CLIENT_ID) {
    console.warn('[Auth] CLIENT_ID가 설정되지 않았어요.');
    return null;
  }

  try {
    // TODO: 백엔드 /api/auth/token 엔드포인트 구축 후 동작
    const response = await fetch(AUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: AUTH_CONFIG.CLIENT_ID,
        redirect_uri: AUTH_CONFIG.REDIRECT_URI,
        code,
      }),
    });

    if (!response.ok) {
      console.error('[Auth] 토큰 발급 실패:', response.status);
      return null;
    }

    const data = await response.json();
    const user: AuthUser = {
      accessToken: data.access_token,
      userKey: data.user_key ?? '',
      nickname: data.nickname,
    };

    setStoredAuth(user);
    return user;
  } catch (error) {
    console.error('[Auth] 콜백 처리 실패:', error);
    return null;
  }
}

function logout(): void {
  clearStoredAuth();
  window.location.href = '/';
}

/**
 * 인증된 API 요청 헤더 생성
 */
function getAuthHeaders(): Record<string, string> {
  const user = getStoredAuth();
  if (!user) return {};

  return {
    Authorization: `Bearer ${user.accessToken}`,
    'x-toss-user-key': user.userKey,
  };
}

/**
 * OAuth가 설정되었는지 확인
 */
function isConfigured(): boolean {
  return AUTH_CONFIG.CLIENT_ID !== '';
}

export const auth = {
  getUser: getStoredAuth,
  login,
  logout,
  handleCallback,
  getAuthHeaders,
  isConfigured,
};
