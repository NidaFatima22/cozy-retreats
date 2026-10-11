const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const api = (u, o) => fetch(u, o && { method: o.method, headers: { 'Content-Type': 'application/json', ...(o.h || {}) }, body: o.body && JSON.stringify(o.body) }).then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j; });
const pkr = n => 'PKR ' + Number(n).toLocaleString('en-PK');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const starIcon = "<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z\"/></svg>";
const stars = n => '<span class="rating" role="img" aria-label="' + n + ' out of 5 stars">' + Array.from({length:5}, (_,i) => '<span class="' + (i < n ? 'filled' : '') + '">' + starIcon + '</span>').join('') + '</span>';
let WA = '923339265522';
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const pages = [['/', 'Home'], ['/properties.html', 'Properties'], ['/reviews.html', 'Reviews'], ['/rules.html', 'House Rules'], ['/contact.html', 'Contact']];

function layout() {
  const cur = location.pathname === '/index.html' ? '/' : location.pathname;
  document.body.insertAdjacentHTML('afterbegin', `<nav><div class="wrap"><a class="brand" href="/" aria-label="Cozy Retreats home"><img class="brand-mark" src="/images/logo-mark.png" alt=""><span>Cozy Retreats<small>APARTMENTS &amp; SUITES</small></span></a><button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="navigation-links"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div class="links" id="navigation-links">${pages.map(([h, t]) => `<a href="${h}" class="${h === cur ? 'on' : ''}">${t}</a>`).join('')}<a class="btn sm" href="/contact.html">Book Now</a></div></div></nav>`);
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap"><div class="g"><div><h3>COZY RETREATS</h3><p class="mut">Apartments & Suites in Lahore. Comfortable stays, simple booking.</p></div><div><b>Explore</b>${pages.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div><div><b>Contact</b><a class="email-link" href="mailto:cozyretreats585@gmail.com">cozyretreats585@gmail.com</a><a href="tel:+923339265522">0333 9265522</a><a class="wal" target="_blank" rel="noopener">WhatsApp us</a></div></div><p class="mut c" style="margin-top:30px">© ${new Date().getFullYear()} Cozy Retreats. All rights reserved.</p></div></footer><a class="fab wal" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 3v-11A8.5 8.5 0 0 1 9.5 3H13a8 8 0 0 1 8 8.5Z"/><path d="M7 10h10M7 14h6"/></svg></a>`);
  $$('.wal').forEach(a => a.href = wa('Hi Cozy Retreats, I would like to know about availability.'));
  const n = $('nav'); addEventListener('scroll', () => n.classList.toggle('s', scrollY > 30)); n.classList.toggle('s', scrollY > 30);
  const closeMenu = () => { $('.links').classList.remove('open'); $('.burger').setAttribute('aria-expanded', 'false'); };
  $('.burger').onclick = () => { const expanded = $('.links').classList.toggle('open'); $('.burger').setAttribute('aria-expanded', String(expanded)); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('.links a').forEach(a => a.addEventListener('click', closeMenu));
}
function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv:not(.in)').forEach((el, i) => { el.style.transitionDelay = (i % 6) * 80 + 'ms'; io.observe(el); });
}
const card = p => `<a class="card rv" href="/property.html?slug=${p.slug}"><div class="im"><img loading="lazy" src="${p.images[0]}" alt="${esc(p.name)}"></div><div class="b"><div style="display:flex;justify-content:space-between;align-items:center"><span class="tag">${esc(p.type)}</span><span class="tag ${p.available ? '' : 'x'}">${p.available ? 'Available' : 'Booked'}</span></div><h3 style="margin:10px 0 4px">${esc(p.name)}</h3><p class="mut"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(p.location)}</p><p class="price" style="margin-top:8px">${pkr(p.price)} <small class="mut" style="font-weight:400">/ night</small></p></div></a>`;
const revCard = r => `<div class="rev rv"><div class="stars">${stars(r.rating)}</div><p style="margin:10px 0">“${esc(r.text)}”</p><b>${esc(r.name)}</b>${r.property ? `<span class="mut"> · ${esc(r.property)}</span>` : ''}</div>`;

function bookingForm(el, props, pre) {
  el.innerHTML = `<form id="bf"><h3>Book on WhatsApp</h3><p class="mut">Add your stay details, then send your message on WhatsApp. We will confirm availability and pricing in the chat.</p><div><label for="booking-name">Your name</label><input id="booking-name" name="name" autocomplete="name" maxlength="60" required></div><div><label for="booking-property">Property</label><select id="booking-property" name="property"><option>General enquiry</option>${props.map(p => `<option ${p.slug === pre ? 'selected' : ''}>${esc(p.name)} – ${esc(p.area)}</option>`).join('')}</select></div><div class="two"><div><label for="booking-checkin">Check-in</label><input id="booking-checkin" name="checkin" type="date" required></div><div><label for="booking-checkout">Check-out</label><input id="booking-checkout" name="checkout" type="date" required></div></div><div><label for="booking-guests">Guests</label><input id="booking-guests" name="guests" type="number" min="1" max="10" step="1" value="2" required></div><div><label for="booking-message">Message (optional)</label><textarea id="booking-message" name="message" rows="3" maxlength="500"></textarea></div><p class="mut">Your booking is confirmed only after we reply on WhatsApp. Please read our <a class="text-link" href="/rules.html">house rules</a> before booking.</p><button type="submit" class="btn wa">Continue to WhatsApp</button></form>`;
  const f = $('#bf', el), checkin = f.elements.checkin, checkout = f.elements.checkout;
  const localDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  checkin.min = localDate(new Date());
  const validateDates = () => {
    const next = checkin.value ? new Date(checkin.value + 'T12:00:00') : new Date();
    next.setDate(next.getDate() + 1);
    checkout.min = localDate(next);
    checkout.setCustomValidity(checkout.value && checkout.value < checkout.min ? 'Check-out must be after check-in.' : '');
  };
  checkin.addEventListener('input', validateDates);
  checkout.addEventListener('input', validateDates);
  validateDates();
  f.onsubmit = e => {
    e.preventDefault(); validateDates();
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f));
    location.assign(wa(`Hi Cozy Retreats! I would like to book a stay.\nName: ${d.name.trim()}\nProperty: ${d.property}\nCheck-in: ${d.checkin}\nCheck-out: ${d.checkout}\nGuests: ${d.guests}\nPlease share details of the 20% winter offer.${d.message.trim() ? '\nMessage: ' + d.message.trim() : ''}`));
  };
}
function reviewForm(el, props) {
  let r = 5;
  el.innerHTML = `<form id="rf"><h3>Share your stay</h3><div><label>Your name</label><input name="name" required maxlength="60"></div><div><label>Property stayed at</label><select name="property"><option value="">Select (optional)</option>${props.map(p => `<option>${esc(p.name)} – ${esc(p.area)}</option>`).join('')}</select></div><div class="stars pick"></div><div><label>Your experience</label><textarea name="text" rows="4" required maxlength="600"></textarea></div><div class="msg"></div><button class="btn">Submit Review</button></form>`;
  const f = $('#rf', el), pk = $('.pick', f), m = $('.msg', f);
  const paint = () => pk.innerHTML = [1, 2, 3, 4, 5].map(i => `<button type="button" data-i="${i}" aria-label="${i} stars" aria-pressed="${i === r}" class="rating-button ${i <= r ? 'filled' : ''}">${starIcon}</button>`).join('');
  paint(); pk.onclick = e => { const button = e.target.closest('[data-i]'); if (button) { r = +button.dataset.i; paint(); } };
  f.onsubmit = async e => {
    e.preventDefault(); m.className = 'msg';
    const submit = $('button[type="submit"]', f) || $('button.btn', f);
    submit.disabled = true;
    try {
      const result = await api('/api/reviews', { method: 'POST', body: { ...Object.fromEntries(new FormData(f)), rating: r } });
      const list = $('#rl');
      if (list && result.review) {
        if (!$('.rev', list)) list.innerHTML = '';
        list.insertAdjacentHTML('afterbegin', revCard(result.review));
        reveal();
      }
      f.reset(); r = 5; paint(); m.className = 'msg ok';
      m.textContent = 'Thank you! Your review is now published.';
    } catch (x) { m.className = 'msg er'; m.textContent = x.message; }
    finally { submit.disabled = false; }
  };
}

const P = {
  async home() {
    const [ps, rs] = await Promise.all([api('/api/properties'), api('/api/reviews')]);
    $('#feat').innerHTML = ps.slice(0, 3).map(card).join('');
    $('#revs').innerHTML = rs.slice(0, 3).map(revCard).join('');
    $('#revs').closest('section').hidden = !rs.length;
  },
  async properties() {
    const ps = await api('/api/properties'), areas = ['All', ...new Set(ps.map(p => p.area))];
    $('#filters').innerHTML = areas.map((a, i) => `<button class="chip ${i ? '' : 'on'}">${a}</button>`).join('');
    const show = a => { $('#list').innerHTML = ps.filter(p => a === 'All' || p.area === a).map(card).join(''); reveal(); };
    $('#filters').onclick = e => { if (e.target.matches('.chip')) { $$('.chip').forEach(c => c.classList.remove('on')); e.target.classList.add('on'); show(e.target.textContent); } };
    show('All');
  },
  async property() {
    const slug = new URLSearchParams(location.search).get('slug'), ps = await api('/api/properties'), p = ps.find(x => x.slug === slug);
    if (!p) { $('#d').innerHTML = '<p class="c">Property not found. <a class="btn sm" href="/properties.html">View all</a></p>'; return; }
    document.title = p.name + ' – Cozy Retreats';
    $('#d').innerHTML = `<div class="det"><div class="rv"><img class="main" id="mi" src="${p.images[0]}" alt="${esc(p.name)}"><div class="thumbs">${p.images.map((s, i) => `<img src="${s}" class="${i ? '' : 'on'}" alt="Photo ${i + 1}">`).join('')}</div><span class="tag">${esc(p.type)}</span> <span class="tag ${p.available ? '' : 'x'}">${p.available ? 'Available' : 'Currently booked'}</span><h1 style="margin:12px 0 6px">${esc(p.name)}</h1><p class="mut"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(p.location)}</p><p class="price" style="margin:12px 0">${pkr(p.price)} <small class="mut" style="font-weight:400">/ night</small></p><p>${esc(p.description)}</p><br><a class="btn wa" target="_blank" rel="noopener" href="${wa('Hi, I am interested in ' + p.name + ' (' + p.area + ').')}">WhatsApp about this property</a></div><div class="box rv" id="bk"></div></div>`;
    $('.thumbs').onclick = e => { if (e.target.tagName === 'IMG') { $$('.thumbs img').forEach(i => i.classList.remove('on')); e.target.classList.add('on'); const m = $('#mi'); m.style.opacity = 0; setTimeout(() => { m.src = e.target.src; m.style.opacity = 1; }, 250); } };
    bookingForm($('#bk'), ps, slug);
  },
  async reviews() {
    const [ps, rs] = await Promise.all([api('/api/properties'), api('/api/reviews')]);
    $('#rl').innerHTML = rs.length ? rs.map(revCard).join('') : '<p class="mut">Stayed with us? Share your experience below.</p>';
    reviewForm($('#rform'), ps);
  },
  async contact() { bookingForm($('#cform'), await api('/api/properties')); },
  admin() {
    let pw = sessionStorage.getItem('cr_admin') || '';
    const call = (u, method, body) => api(u, { method, body, h: { 'x-admin': pw } });
    const login = $('#login'), dash = $('#dash');
    async function load() {
      try {
        const d = await call('/api/admin/data'); login.style.display = 'none'; dash.style.display = 'block';
        $('#aprops').innerHTML = `<tr><th>Property</th><th>Price/night</th><th>Available</th><th></th></tr>` + d.properties.map(p => `<tr><td>${esc(p.name)} – ${esc(p.area)}</td><td><input type="number" value="${p.price}" id="pr-${p.slug}" style="width:110px"></td><td><input type="checkbox" id="av-${p.slug}" ${p.available ? 'checked' : ''} style="width:auto"></td><td><button class="btn sm" data-s="${p.slug}">Save</button></td></tr>`).join('');
        $('#abook').innerHTML = `<tr><th>Date</th><th>Guest</th><th>Property</th><th>Stay</th><th>Status</th><th></th></tr>` + (d.bookings.map(b => `<tr><td>${new Date(b.date).toLocaleDateString()}</td><td>${esc(b.name)}<br><a href="https://wa.me/92${esc(b.phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, ''))}" target="_blank">${esc(b.phone)}</a><br>${esc(b.email)}</td><td>${esc(b.property)}<br>${b.guests} guests</td><td>${b.checkin || '-'} → ${b.checkout || '-'}<br><i>${esc(b.message)}</i></td><td><select data-b="${b.id}">${['new', 'contacted', 'confirmed', 'cancelled'].map(s => `<option ${s === b.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><button class="btn o sm" data-db="${b.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6" class="mut">No bookings yet</td></tr>');
        $('#arev').innerHTML = `<tr><th>Review</th><th>Status</th><th></th></tr>` + (d.reviews.map(r => `<tr><td><span class="stars">${stars(r.rating)}</span> <b>${esc(r.name)}</b><br>${esc(r.text)}</td><td>${(r.approved || !r.moderated) ? 'Published' : 'Pending'}</td><td><button class="btn sm" data-ap="${r.id}" data-v="${!(r.approved || !r.moderated)}">${(r.approved || !r.moderated) ? 'Unpublish' : 'Approve'}</button><button class="btn o sm" data-dr="${r.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="3" class="mut">No reviews yet</td></tr>');
      } catch (e) { sessionStorage.removeItem('cr_admin'); login.style.display = 'block'; dash.style.display = 'none'; if (pw) $('#lerr').textContent = e.message; }
    }
    $('#lf').onsubmit = e => { e.preventDefault(); pw = $('#pw').value; sessionStorage.setItem('cr_admin', pw); load(); };
    $('#out').onclick = () => { sessionStorage.removeItem('cr_admin'); pw = ''; load(); };
    dash.onclick = async e => { const t = e.target, d = t.dataset;
      if (d.s) await call('/api/admin/properties/' + d.s, 'PATCH', { price: $('#pr-' + d.s).value, available: $('#av-' + d.s).checked });
      else if (d.db && confirm('Delete this booking?')) await call('/api/admin/bookings/' + d.db, 'DELETE');
      else if (d.ap) await call('/api/admin/reviews/' + d.ap, 'PATCH', { approved: d.v === 'true' });
      else if (d.dr && confirm('Delete this review?')) await call('/api/admin/reviews/' + d.dr, 'DELETE'); else return; load(); };
    dash.onchange = async e => { if (e.target.dataset.b) await call('/api/admin/bookings/' + e.target.dataset.b, 'PATCH', { status: e.target.value }); };
    if (pw) load();
  }
};
(async () => { layout(); try { WA = (await api('/api/config')).whatsapp; $$('.wal').forEach(a => a.href = wa('Hi Cozy Retreats, I would like to know about availability.')); } catch {} try { await P[document.body.dataset.page]?.(); } catch (e) { console.error(e); } reveal(); })();
