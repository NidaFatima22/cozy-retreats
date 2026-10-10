const express = require('express'), fs = require('fs'), path = require('path');
try { for (const l of fs.readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; } } catch {}
const app = express(), F = path.join(__dirname, 'data', 'db.json');
const PASS = process.env.ADMIN_PASSWORD || 'admin123';
const load = () => JSON.parse(fs.readFileSync(F, 'utf8'));
const save = d => fs.writeFileSync(F, JSON.stringify(d, null, 1));
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const clean = (s, n = 500) => String(s || '').trim().slice(0, n);
const auth = (q, s, n) => q.headers['x-admin'] === PASS ? n() : s.status(401).json({ error: 'Wrong password' });

async function notify(subject, text) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return;
  try {
    const t = require('nodemailer').createTransport({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.sendMail({ from: process.env.SMTP_USER, to: process.env.NOTIFY_EMAIL, subject, text });
  } catch (e) { console.error('Email failed:', e.message); }
}

app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/config', (q, s) => s.json({ whatsapp: process.env.WHATSAPP || '923339265522' }));
app.get('/api/properties', (q, s) => s.json(load().properties));
app.get('/api/reviews', (q, s) => s.json(load().reviews.filter(r => r.approved).reverse()));

app.post('/api/reviews', (q, s) => {
  const { name, text, property } = q.body, rating = +q.body.rating;
  if (!clean(name, 60) || !clean(text, 600) || !(rating >= 1 && rating <= 5)) return s.status(400).json({ error: 'Name, rating (1-5) and review text are required.' });
  const d = load(), r = { id: id(), name: clean(name, 60), rating, text: clean(text, 600), property: clean(property, 80), approved: false, date: new Date().toISOString() };
  d.reviews.push(r); save(d); notify('New review on Cozy Retreats', `${r.name} (${r.rating}/5): ${r.text}`);
  s.json({ ok: true });
});

app.post('/api/bookings', (q, s) => {
  const b = q.body;
  if (!clean(b.name, 60) || !/^[0-9+\-\s]{9,18}$/.test(clean(b.phone, 18))) return s.status(400).json({ error: 'Valid name and phone number are required.' });
  if (b.checkin && b.checkout && b.checkout <= b.checkin) return s.status(400).json({ error: 'Check-out must be after check-in.' });
  const d = load(), r = { id: id(), name: clean(b.name, 60), phone: clean(b.phone, 18), email: clean(b.email, 80), property: clean(b.property, 80) || 'General enquiry', checkin: clean(b.checkin, 10), checkout: clean(b.checkout, 10), guests: +b.guests || 1, message: clean(b.message, 500), status: 'new', date: new Date().toISOString() };
  d.bookings.push(r); save(d);
  notify('New booking request - Cozy Retreats', Object.entries(r).map(([k, v]) => `${k}: ${v}`).join('\n'));
  s.json({ ok: true });
});

app.get('/api/admin/data', auth, (q, s) => { const d = load(); s.json({ ...d, bookings: [...d.bookings].reverse(), reviews: [...d.reviews].reverse() }); });
app.patch('/api/admin/bookings/:id', auth, (q, s) => { const d = load(), b = d.bookings.find(x => x.id === q.params.id); if (!b) return s.sendStatus(404); b.status = clean(q.body.status, 20); save(d); s.json(b); });
app.delete('/api/admin/bookings/:id', auth, (q, s) => { const d = load(); d.bookings = d.bookings.filter(x => x.id !== q.params.id); save(d); s.json({ ok: true }); });
app.patch('/api/admin/reviews/:id', auth, (q, s) => { const d = load(), r = d.reviews.find(x => x.id === q.params.id); if (!r) return s.sendStatus(404); r.approved = !!q.body.approved; save(d); s.json(r); });
app.delete('/api/admin/reviews/:id', auth, (q, s) => { const d = load(); d.reviews = d.reviews.filter(x => x.id !== q.params.id); save(d); s.json({ ok: true }); });
app.patch('/api/admin/properties/:slug', auth, (q, s) => { const d = load(), p = d.properties.find(x => x.slug === q.params.slug); if (!p) return s.sendStatus(404); if (q.body.price) p.price = +q.body.price; if (typeof q.body.available === 'boolean') p.available = q.body.available; save(d); s.json(p); });

app.listen(process.env.PORT || 3000, () => console.log('Cozy Retreats running on http://localhost:' + (process.env.PORT || 3000)));
