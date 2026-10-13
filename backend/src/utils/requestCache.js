const { AsyncLocalStorage } = require('async_hooks');

// Request-scoped memo cache for expensive analytics reads.
// Same expensive computation (e.g. per-course student analytics) is requested
// multiple times while serving a single dashboard request (overview +
// departments + trends). Deduping within the request cuts whole waves of DB
// round trips, with zero cross-request staleness: the cache dies with the
// request.
const storage = new AsyncLocalStorage();

function middleware(req, res, next) {
  storage.run({ cache: new Map(), marks: [{ label: 'start', at: Date.now() }] }, next);
}

function store() {
  return storage.getStore();
}

function get(key) {
  const s = store();
  return s ? s.cache.get(key) : undefined;
}

function set(key, value) {
  const s = store();
  if (s) s.cache.set(key, value);
}

async function memo(key, fn) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  set(key, value);
  return value;
}

// ── Performance marks ──────────────────────────────────────
// mark('label') records elapsed ms since request start. summary() renders a
// single-line breakdown like: total=3920ms overview=2100ms dept=300ms ...
function mark(label) {
  const s = store();
  if (!s) return 0;
  const at = Date.now();
  const elapsed = at - s.marks[0].at;
  s.marks.push({ label, at, elapsed });
  return elapsed;
}

function summary() {
  const s = store();
  if (!s || s.marks.length < 2) return 'no-marks';
  const total = s.marks[s.marks.length - 1].at - s.marks[0].at;
  const parts = s.marks.slice(1).map((m) => `${m.label}=${m.elapsed}ms`);
  return `total=${total}ms ` + parts.join(' ');
}

module.exports = { middleware, get, set, memo, mark, summary };
