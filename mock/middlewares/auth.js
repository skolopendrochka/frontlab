const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function createToken(userId) {
  const payload = { userId, exp: Date.now() + 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function parseToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function networkDelay(req, res, next) {
  setTimeout(next, 120 + Math.floor(Math.random() * 480));
}

function corsHeaders(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

function authRoutes(req, res, next) {
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body ?? {};
    const db = readDb();
    const user = db.users.find((item) => item.email === email && item.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Неверная почта или пароль' });
    }
    const { password: _hidden, ...safeUser } = user;
    return res.json({ token: createToken(user.id), user: safeUser });
  }

  if (req.method === 'POST' && req.path === '/auth/register') {
    const { email, password, name } = req.body ?? {};
    const db = readDb();
    if (db.users.some((item) => item.email === email)) {
      return res.status(400).json({ message: 'Почта уже занята' });
    }
    const nextId = db.users.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const user = { id: nextId, email, password, name };
    db.users.push(user);
    writeDb(db);
    const { password: _hidden, ...safeUser } = user;
    return res.status(201).json({ token: createToken(user.id), user: safeUser });
  }

  if (req.method === 'POST' && req.path === '/auth/refresh') {
    const { token } = req.body ?? {};
    const payload = parseToken(token);
    if (!payload) return res.status(401).json({ message: 'Токен недействителен' });
    return res.json({ token: createToken(payload.userId) });
  }

  next();
}

function requireAuth(req, res, next) {
  const guarded = ['/todos', '/tags'].some((prefix) => req.path.startsWith(prefix));
  if (!guarded) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нужна авторизация' });
  }

  const payload = parseToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ message: 'Токен просрочен' });
  }

  req.userId = payload.userId;
  next();
}

module.exports = {
  networkDelay,
  corsHeaders,
  authRoutes,
  requireAuth,
};
