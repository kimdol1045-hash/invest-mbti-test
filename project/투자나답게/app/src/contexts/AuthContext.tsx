import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, type AuthUser } from '../utils/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthConfigured: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isAuthConfigured: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(auth.getUser);

  useEffect(() => {
    // OAuth 콜백 처리: URL에 code 파라미터가 있으면 토큰 교환
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      auth.handleCallback(code).then((authUser) => {
        if (authUser) {
          setUser(authUser);
        }
        // URL에서 code 제거
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    isAuthConfigured: auth.isConfigured(),
    login: auth.login,
    logout: () => {
      auth.logout();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
