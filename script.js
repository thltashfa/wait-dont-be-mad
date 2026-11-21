/* ============ helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const rand = (a, b) => Math.random() * (b - a) + a;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const COLORS = ['#C4B5FD', '#3B82F6', '#38BDF8', '#F8FAFC', '#7dd3fc'];
const fx = $('#fx');
const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

/* ============ ambient: twinkling sparkles + floating outline hearts ============ */
for (let i = 0; i < 28; i++) {
  const s = document.createElement('span');
  s.className = 'tw';
  s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;--s:${rand(6, 13)}px;--c:${pick(['#C4B5FD', '#38BDF8', '#F8FAFC'])};` +
    `--t:${rand(3, 7)}s;animation-delay:${-rand(0, 6)}s`;
  fx.appendChild(s);
}
let heartRate = 1700;
function floatHeart() {
  const el = document.createElement('div');
  el.className = 'fh';
  if (document.body.classList.contains('finale') && Math.random() < .5) el.classList.add('solid');
  el.innerHTML = HEART;
  el.style.cssText = `left:${rand(0, 100)}%;--s:${rand(12, 32)}px;--c:${pick(COLORS)};--o:${rand(.2, .55)};` +
    `--t:${rand(11, 20)}s;--dx:${rand(-80, 80)}px;--r:${rand(-50, 50)}deg`;
  fx.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
(function loop() { floatHeart(); setTimeout(loop, heartRate * rand(.6, 1.3)); })();

function sparkle(x, y, spread = 60, size = [6, 14]) {
  const el = document.createElement('span');
  el.className = 'sp';
  el.style.cssText = `left:${x}px;top:${y}px;--s:${rand(...size)}px;--c:${pick(COLORS)};--t:${rand(.5, .9)}s;` +
    `--dx:${rand(-spread, spread)}px;--dy:${rand(-spread, spread)}px`;
  fx.appendChild(el);
  setTimeout(() => el.remove(), 950);
}
function burst(x, y, n = 14, hearts = 5) {
  for (let i = 0; i < n; i++) sparkle(x, y, 110, [6, 16]);
  for (let i = 0; i < hearts; i++) {
    const h = document.createElement('div');
    h.className = 'pop-heart';
    h.innerHTML = HEART;
    h.style.cssText = `left:${x}px;top:${y}px;--s:${rand(14, 26)}px;--c:${pick(COLORS)};--t:${rand(.7, 1.1)}s;` +
      `--dx:${rand(-120, 120)}px;--dy:${rand(-140, -20)}px`;
    fx.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }
}

/* ============ custom cursor (desktop) ============ */
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.body.classList.add('has-cursor');
  const dot = $('#curDot'), ring = $('#curRing');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, last = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    const now = performance.now();
    if (now - last > 80) { last = now; sparkle(mx, my, 22, [4, 8]); }
    ring.classList.toggle('hover', !!e.target.closest('button, input'));
  });
  (function follow() {
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(follow);
  })();
}

/* ============ scene manager ============ */
const scenes = [...document.querySelectorAll('.scene')];
const stageEl = $('#stage'), barFill = $('#barFill');
let current = 0, runId = 0;
const hooks = { 1: runApology, 2: startGame, 3: resetNotes, 4: resetFinal };

function go(n) {
  scenes[current].classList.remove('is-active');
  current = n; runId++;
  scenes[n].classList.add('is-active');
  stageEl.textContent = `0${n + 1} / 0${scenes.length}`;
  barFill.style.width = ((n + 1) / scenes.length * 100) + '%';
  document.body.classList.toggle('finale', n === 4);
  heartRate = n === 4 ? 280 : 1700;
  hooks[n] && hooks[n]();
}
go(0);

/* ============ STAGE 01: opening + tombol nope kabur ============ */
const yes = $('#yes'), no = $('#no'), taunt = $('#taunt');
const taunts = ['oops too slow!! try the other one 👀', "error 404: 'nope' not allowed today", 'nice try 😝',
  'the button has legs, sorry', "it's shy, stop chasing it", 'skill issue 💅', 'plot twist: it hates being clicked',
  'wrong button, bestie', 'catch me if you can ✨', 'not today~'];
let dodges = 0, surrendered = false, placeholder = null, lastDodge = 0, lastTaunt = '';

function dodge() {
  if (surrendered) return;
  const now = performance.now();
  if (now - lastDodge < 220) return;
  lastDodge = now;
  if (!no.classList.contains('flying')) {
    const r = no.getBoundingClientRect();
    placeholder = document.createElement('span');
    placeholder.style.cssText = `width:${r.width}px;height:${r.height}px;display:inline-block`;
    no.before(placeholder);
    no.classList.add('flying');
  }
  dodges++;
  const r = no.getBoundingClientRect(), pad = 14;
  let x, y, tries = 0;
  do {
    x = rand(pad, Math.max(pad, innerWidth - r.width - pad));
    y = rand(80, Math.max(90, innerHeight - r.height - pad));
    tries++;
  } while (tries < 12 && Math.hypot(x - r.left, y - r.top) < 120);
  no.style.left = x + 'px'; no.style.top = y + 'px';
  no.style.transform = `scale(${Math.max(.65, 1 - dodges * .04)}) rotate(${rand(-10, 10)}deg)`;
  let t; do { t = pick(taunts); } while (t === lastTaunt);
  lastTaunt = t; taunt.textContent = t;
  sparkle(r.left + r.width / 2, r.top + r.height / 2, 40);
  if (dodges >= 8) {                                    // akhirnya menyerah
    surrendered = true;
    taunt.textContent = 'ok ok, you win 🥹';
    no.textContent = 'fine, okay 🙄';
    no.style.transform = 'scale(1)';
  }
}
no.addEventListener('pointerenter', dodge);
no.addEventListener('pointerdown', e => { if (!surrendered) { e.preventDefault(); dodge(); } });
no.addEventListener('click', e => { if (surrendered) go(1); else e.preventDefault(); });
addEventListener('pointermove', e => {                  // kabur sebelum kursor menyentuh
  if (current !== 0 || surrendered || e.pointerType === 'touch') return;
  const r = no.getBoundingClientRect();
  if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 90) dodge();
});
yes.addEventListener('click', () => { burst(...centerOf(yes), 16, 6); go(1); });

function resetOpening() {
  dodges = 0; surrendered = false; lastTaunt = ''; taunt.textContent = '';
  no.classList.remove('flying'); no.removeAttribute('style'); no.textContent = 'nope 🙄';
  placeholder && placeholder.remove(); placeholder = null;
}

/* ============ STAGE 02: apology ============ */
const firstLine = $('#firstLine'), speech = $('#speech'), speechText = $('#speechText'), forgive = $('#forgive');
const SENTENCE = "I'm sorry for treating you badly sometimes. I know I could've done better, and [you didn't deserve that]. I'm really sorry, okay? ♡";
function speechHTML() {                                  // [ ... ] = kata bergradient
  let hl = false;
  return SENTENCE.split(' ').map((raw, i) => {
    let w = raw;
    if (w.startsWith('[')) { hl = true; w = w.slice(1); }
    const c = w.indexOf(']');
    let inner;
    if (c > -1) { inner = `<span class="hl">${w.slice(0, c)}</span>${w.slice(c + 1)}`; hl = false; }
    else inner = hl ? `<span class="hl">${w}</span>` : w;
    return `<span class="w" style="--d:${i * 70 + 500}ms">${inner}</span>`;
  }).join(' ');
}
async function runApology() {
  const id = runId;
  firstLine.classList.remove('show'); speech.classList.remove('show'); forgive.hidden = true;
  speechText.innerHTML = speechHTML();
  const i = speechText.children.length;
  await sleep(450); if (id !== runId) return;
  firstLine.classList.add('show');
  await sleep(700); if (id !== runId) return;
  speech.classList.add('show');
  await sleep(i * 70 + 1500); if (id !== runId) return;
  forgive.hidden = false;
}
forgive.addEventListener('click', async () => {
  const id = runId;
  forgive.textContent = 'really?? 🥹';
  burst(...centerOf(forgive), 26, 10);
  await sleep(1000);
  if (id === runId) go(2);
  forgive.textContent = 'forgive me? ♡';
});

/* ============ STAGE 03: catch my hearts ============ */
const arena = $('#arena'), win = $('#win'), score = $('#score'), scoreTxt = $('#scoreTxt');
const GOAL = 5, MAX_ON_SCREEN = 3;
let caught = 0;
const flyers = new Set();

(function fly() {                                       // hati melayang & memantul
  const w = arena.clientWidth, h = arena.clientHeight;
  flyers.forEach(o => {
    o.x += o.vx; o.y += o.vy;
    if (o.x < 4 || o.x > w - o.s - 4) { o.vx *= -1; o.x = Math.min(Math.max(o.x, 4), w - o.s - 4); }
    if (o.y < 4 || o.y > h - o.s - 24) { o.vy *= -1; o.y = Math.min(Math.max(o.y, 4), h - o.s - 24); }
    o.el.style.left = o.x + 'px'; o.el.style.top = o.y + 'px';
  });
  requestAnimationFrame(fly);
})();

function updateScore(pulse) {
  scoreTxt.textContent = `${caught} / ${GOAL} caught`;
  if (pulse) { score.classList.remove('pulse'); void score.offsetWidth; score.classList.add('pulse'); }
}
function startGame() {
  const id = runId;
  caught = 0; win.hidden = true; updateScore();
  flyers.forEach(o => o.el.remove()); flyers.clear();
  setTimeout(() => fill(id), 700);
}
function fill(id) {
  while (id === runId && flyers.size < Math.min(MAX_ON_SCREEN, GOAL - caught)) spawnHeart(id);
}
function spawnHeart(id) {
  const size = rand(44, 64), w = arena.clientWidth, h = arena.clientHeight;
  const el = document.createElement('button');
  el.className = 'catch' + (Math.random() < .25 ? ' lav' : '');
  el.type = 'button'; el.setAttribute('aria-label', 'catch heart'); el.innerHTML = HEART;
  const k = 1 + caught * .15, sign = () => (Math.random() < .5 ? -1 : 1);
  const o = { el, s: size, x: rand(8, w - size - 8), y: rand(8, h - size - 30),
    vx: rand(.5, 1.1) * sign() * k, vy: rand(.4, .9) * sign() * k };
  el.style.cssText = `width:${size}px;height:${size}px;left:${o.x}px;top:${o.y}px`;
  arena.appendChild(el); flyers.add(o);

  let done = false;
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (done || id !== runId) return; done = true; flyers.delete(o);
    caught++; updateScore(true);
    burst(...centerOf(el), 12, 4);
    el.remove();
    if (caught >= GOAL) {
      flyers.forEach(f => f.el.remove()); flyers.clear();
      return setTimeout(() => { win.hidden = false; burst(...centerOf(arena), 44, 16); }, 350);
    }
    setTimeout(() => fill(id), 250);
  });
  setTimeout(() => {                                    // hati yang kelamaan menghilang
    if (done || id !== runId) return;
    done = true; flyers.delete(o); el.classList.add('fade');
    setTimeout(() => { el.remove(); fill(id); }, 400);
  }, Math.max(3200, 5400 - caught * 400));
}
$('#toLove').addEventListener('click', () => go(3));

/* ============ STAGE 04: random love generator ============ */
const loves = ["you're still my favorite notification.", 'sending you a little extra love today.',
  "don't forget that you're appreciated.", "here's a virtual hug ♡", 'you deserve all the good things.'];
const tap = $('#tap'), msg = $('#msg');
let bag = [], lastMsg = '', swapping = false;

function resetNotes() { bag = []; lastMsg = ''; msg.className = 'msg'; msg.textContent = 'tap the button below for a note ✦'; }
tap.addEventListener('click', async () => {
  if (swapping) return;
  swapping = true;
  if (!bag.length) {                                    // acak, tidak pernah sama 2x berturut-turut
    bag = [...loves].sort(() => Math.random() - .5);
    if (bag[bag.length - 1] === lastMsg) bag.unshift(bag.pop());
  }
  lastMsg = bag.pop();
  burst(...centerOf(tap), 10, 3);
  msg.classList.remove('in'); msg.classList.add('out');
  await sleep(280);
  msg.textContent = lastMsg;
  msg.classList.remove('out'); void msg.offsetWidth; msg.classList.add('in');
  await sleep(300);
  swapping = false;
});
$('#toFinal').addEventListener('click', () => go(4));

/* ============ STAGE 05: final surprise ============ */
const last = $('#last'), finalMsg = $('#finalMsg'), again = $('#again');
function resetFinal() {
  last.hidden = false; finalMsg.hidden = true; again.hidden = true;
  finalMsg.querySelectorAll('p').forEach(p => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
}
last.addEventListener('click', async () => {
  const id = runId;
  burst(...centerOf(last), 44, 16);
  last.hidden = true; finalMsg.hidden = false;
  heartRate = 110;
  for (let i = 0; i < 6; i++) setTimeout(() => burst(rand(40, innerWidth - 40), rand(100, innerHeight - 100), 18, 5), i * 600 + 400);
  setTimeout(() => burst(innerWidth / 2, innerHeight / 2, 60, 20), 3300);
  await sleep(5200);
  if (id === runId) again.hidden = false;
});

/* ============ replay (musik tidak ikut berhenti) ============ */
function replay() { resetOpening(); go(0); }
again.addEventListener('click', replay);

/* ============ music: assets/abadi.mp3 ============ */
const bgm = $('#bgm'), playBtn = $('#playBtn'), playLabel = $('#playLabel'), vol = $('#vol'), player = $('#player'), toastEl = $('#toast');
let toastT;
function toast(text) {
  toastEl.textContent = text; toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 4200);
}
bgm.volume = vol.value / 100;
vol.addEventListener('input', () => { bgm.volume = vol.value / 100; });
bgm.addEventListener('play', () => {
  player.classList.add('playing'); player.classList.remove('nudge');
  playLabel.textContent = 'pause vibe';
  playBtn.setAttribute('aria-pressed', 'true'); playBtn.setAttribute('aria-label', 'pause music');
});
bgm.addEventListener('pause', () => {
  player.classList.remove('playing'); playLabel.textContent = 'play vibe';
  playBtn.setAttribute('aria-pressed', 'false'); playBtn.setAttribute('aria-label', 'play music');
});
playBtn.addEventListener('click', async () => {        // baru main setelah user klik
  if (!bgm.paused) return bgm.pause();
  try { await bgm.play(); }
  catch (err) { toast('Musik belum ditemukan. Taruh file MP3 kamu di assets/abadi.mp3 ya ♡'); }
});
