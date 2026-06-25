const currentTimeEl = document.getElementById('current-time');
const alarmInput    = document.getElementById('alarm-time');
const setBtn        = document.getElementById('set-btn');
const clearBtn      = document.getElementById('clear-btn');
const statusEl      = document.getElementById('status');
const modal         = document.getElementById('alert-modal');
const stopBtn       = document.getElementById('stop-btn');

let alarmTime  = null;
let beepTimer  = null;
let audioCtx   = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function tick() {
  const now = new Date();
  const h   = pad(now.getHours());
  const m   = pad(now.getMinutes());
  const s   = pad(now.getSeconds());
  currentTimeEl.textContent = `${h}:${m}:${s}`;

  if (alarmTime) {
    const current = `${h}:${m}:${s}`;
    if (current === alarmTime) {
      triggerAlarm();
    }
  }
}

function triggerAlarm() {
  modal.classList.remove('hidden');
  startBeep();
}

function startBeep() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function beep() {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.6);
  }

  beep();
  beepTimer = setInterval(beep, 900);
}

function stopAlarm() {
  clearInterval(beepTimer);
  beepTimer = null;
  modal.classList.add('hidden');
  resetAlarm();
}

function resetAlarm() {
  alarmTime = null;
  alarmInput.value = '';
  setBtn.disabled = false;
  clearBtn.disabled = true;
  statusEl.textContent = '';
}

setBtn.addEventListener('click', () => {
  const val = alarmInput.value;
  if (!val) {
    statusEl.textContent = '時刻を選択してください';
    return;
  }

  const [h, m] = val.split(':');
  alarmTime = `${pad(h)}:${pad(m)}:00`;

  setBtn.disabled  = true;
  clearBtn.disabled = false;
  statusEl.textContent = `アラーム設定: ${pad(h)}:${pad(m)}`;
});

clearBtn.addEventListener('click', resetAlarm);
stopBtn.addEventListener('click', stopAlarm);

setInterval(tick, 1000);
tick();
