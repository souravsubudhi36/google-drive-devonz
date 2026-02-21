import store from '../store/dataStore.js';

export function listUsers(req, res) {
  const users = Array.from(store.users.values());
  res.json({ users });
}

export function getCurrentUser(req, res) {
  res.json({ user: req.currentUser });
}
