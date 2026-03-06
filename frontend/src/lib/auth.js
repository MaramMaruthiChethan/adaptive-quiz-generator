export function getStoredUser() {
  const raw = localStorage.getItem("aqg_user");
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
  localStorage.setItem("aqg_token", token);
  localStorage.setItem("aqg_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("aqg_token");
  localStorage.removeItem("aqg_user");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("aqg_token"));
}
