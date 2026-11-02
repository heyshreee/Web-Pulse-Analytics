const SESSION_FLAG = 'webpulse:session';

export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}

export function setSession() {
  try {
    localStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}

export function removeToken() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem(SESSION_FLAG);
  } catch {
    /* storage unavailable */
  }
}

export function clearSession() {
  removeToken();
}

export function isAuthenticated() {
  try {
    const token = getToken();
    const hasSession = localStorage.getItem(SESSION_FLAG) === '1';
    return Boolean(token || hasSession);
  } catch {
    return false;
  }
}
