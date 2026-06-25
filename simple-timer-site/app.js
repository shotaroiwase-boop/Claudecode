const display    = document.getElementById('display');
const ring       = document.getElementById('ring');
const startBtn   = document.getElementById('startBtn');
const pauseBtn   = document.getElementById('pauseBtn');
const resetBtn   = document.getElementById('resetBtn');
const closeBtn   = document.getElementById('closeBtn');
const overlay    = document.getElementById('done-overlay');
const hoursEl    = document.getElementById('hours');
const minutesEl  = document.getElementById('minutes');
const secondsEl  = document.getElementById('seconds');

const CIRCUMFERENCE = 339.3;

let totalSeconds  = 0;
let remaining     = 0;
let timer         = null;
let running       = false;

function pad(n) { return String(n).padStart(2, '0'); }

function setDisplay(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  display.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function setRing(s) {
  const ratio = totalSeconds > 0 ? s / totalSeconds : 1;
  ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
  ring.style.stroke = ratio > 0.3 ? '#6c6cff' : ratio > 0.1 ? '#f0a500' : '#e05c5c';
}

function getInput() {
  const h = parseInt(hoursEl.value)   || 0;
  const m = parseInt(minutesEl.value) || 0;
  const s = parseInt(secondsEl.value) || 0;
  return h * 3600 + m * 60 + s;
}

function setInputsDisabled(disabled) {
  hoursEl.disabled   = disabled;
  minutesEl.disabled = disabled;
  secondsEl.disabled = disabled;
}

function tick() {
  if (remaining <= 0) {
    clearInterval(timer);
    running = false;
    setDisplay(0);
    setRing(0);
    overlay.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    return;
  }
  remaining--;
  setDisplay(remaining);
  setRing(remaining);
}

startBtn.addEventListener('click', () => {
  const input = getInput();
  if (input <= 0) return;

  totalSeconds = input;
  remaining    = input;

  setDisplay(remaining);
  setRing(remaining);
  setInputsDisabled(true);

  timer = setInterval(tick, 1000);
  running = true;

  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
});

pauseBtn.addEventListener('click', () => {
  if (running) {
    clearInterval(timer);
    running = false;
    pauseBtn.textContent = '再開';
  } else {
    timer = setInterval(tick, 1000);
    running = true;
    pauseBtn.textContent = '一時停止';
  }
});

resetBtn.addEventListener('click', reset);
closeBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  reset();
});

function reset() {
  clearInterval(timer);
  running = false;
  remaining = 0;
  totalSeconds = 0;
  setDisplay(0);
  ring.style.strokeDashoffset = 0;
  ring.style.stroke = '#6c6cff';
  setInputsDisabled(false);
  hoursEl.value   = 0;
  minutesEl.value = 0;
  secondsEl.value = 0;
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  pauseBtn.textContent = '一時停止';
}
