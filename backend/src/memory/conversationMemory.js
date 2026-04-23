// Per-user conversation memory
// Keyed by userId — works for both auth and anonymous users

const store = new Map();
const MAX_HISTORY = 20;

export function getHistory(userId) {
  return store.get(userId) ?? [];
}

export function addTurn(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content, timestamp: Date.now() });
  if (history.length > MAX_HISTORY) history.shift();
  store.set(userId, history);
}

export function clearHistory(userId) {
  store.delete(userId);
}