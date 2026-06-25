const display     = document.getElementById('display');
const labelEl     = document.getElementById('display-label');
const ring        = document.getElementById('ring');
const startBtn    = document.getElementById('startBtn');
const pauseBtn    = document.getElementById('pauseBtn');
const resetBtn    = document.getElementById('resetBtn');
const closeBtn    = document.getElementById('closeBtn');
const overlay     = document.getElementById('done-overlay');
const hoursEl     = document.getElementById('hours');
const minutesEl   = document.getElementById('minutes');
const secondsEl   = document.getElementById('seconds');
const canvas      = document.getElementById('confetti-canvas');

const CIRCUMFERENCE = 553;

let totalSeconds = 0;
let remaining    = 0;
let timer        = null;
let running      = false;
let audioCtx     = null;

function pad(n) { return String(n).padStart(2, '0'); }
function fmt(s) {
  return `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`;
}
function setDisplay(s) { display.textContent = fmt(s); }
function setRing(s) {
  const ratio = totalSeconds > 0 ? s / totalSeconds : 1;
  ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
}
function getInput() {
  return (parseInt(hoursEl.value)||0)*3600 + (parseInt(minutesEl.value)||0)*60 + (parseInt(secondsEl.value)||0);
}
function setInputsDisabled(d) {
  hoursEl.disabled = minutesEl.disabled = secondsEl.disabled = d;
}

function beep() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  [0, 0.15, 0.3].forEach(t => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.12);
    osc.start(audioCtx.currentTime + t);
    osc.stop(audioCtx.currentTime + t + 0.12);
  });
}

function tick() {
  if (remaining <= 0) {
    clearInterval(timer); running = false;
    setDisplay(0); setRing(0);
    labelEl.textContent = '完了';
    showDone();
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    return;
  }
  remaining--;
  setDisplay(remaining);
  setRing(remaining);
  const ratio = totalSeconds > 0 ? remaining / totalSeconds : 1;
  if (remaining > 0 && remaining <= 3) beep();
  labelEl.textContent = ratio > 0.5 ? '残り時間' : ratio > 0.2 ? 'もうすぐ...' : '間もなく終了';
}

startBtn.addEventListener('click', () => {
  const input = getInput();
  if (input <= 0) { shake(startBtn); return; }
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  totalSeconds = remaining = input;
  setDisplay(remaining); setRing(remaining);
  setInputsDisabled(true);
  labelEl.textContent = '残り時間';
  timer = setInterval(tick, 1000); running = true;
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
});

pauseBtn.addEventListener('click', () => {
  if (running) {
    clearInterval(timer); running = false;
    pauseBtn.querySelector('span').textContent = '再開';
    pauseBtn.querySelector('svg').innerHTML = '<polygon points="5,3 19,12 5,21"/>';
    labelEl.textContent = '一時停止中';
  } else {
    timer = setInterval(tick, 1000); running = true;
    pauseBtn.querySelector('span').textContent = '一時停止';
    pauseBtn.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    labelEl.textContent = '残り時間';
  }
});

resetBtn.addEventListener('click', reset);
closeBtn.addEventListener('click', () => { overlay.classList.add('hidden'); stopConfetti(); reset(); });

function reset() {
  clearInterval(timer); running = false; remaining = totalSeconds = 0;
  setDisplay(0); ring.style.strokeDashoffset = 0;
  setInputsDisabled(false);
  hoursEl.value = minutesEl.value = secondsEl.value = 0;
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  pauseBtn.querySelector('span').textContent = '一時停止';
  pauseBtn.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  labelEl.textContent = '設定してスタート';
}

function shake(el) {
  el.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:300});
}

let confettiId = null;
const COLORS = ['#a78bfa','#60a5fa','#f472b6','#34d399','#fbbf24','#f87171'];

function showDone() {
  overlay.classList.remove('hidden');
  beep();
  runConfetti();
}

function runConfetti() {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.5,
    r: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random()*COLORS.length)],
    vx: (Math.random()-0.5)*4,
    vy: 2 + Math.random()*4,
    angle: Math.random()*360,
    spin: (Math.random()-0.5)*6,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      if (p.shape === 'rect') ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
      else { ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.07;
    });
    if (pieces.some(p => p.y < canvas.height + 20)) confettiId = requestAnimationFrame(draw);
  }
  if (confettiId) cancelAnimationFrame(confettiId);
  draw();
}

function stopConfetti() {
  if (confettiId) { cancelAnimationFrame(confettiId); confettiId = null; }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
