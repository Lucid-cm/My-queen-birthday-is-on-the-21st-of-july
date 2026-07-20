// ---------- background melody (original, synthesized) ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.0;
masterGain.connect(audioCtx.destination);

const NOTE_FREQ = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00,
  A4:440.00, B4:493.88, C5:523.25, D5:587.33, E5:659.25, G4b:369.99
};

// a warm, original cheerful melody (not the copyrighted "Happy Birthday" tune)
const melody = [
  {n:'C4',d:0.42},{n:'E4',d:0.42},{n:'G4',d:0.42},{n:'E4',d:0.42},
  {n:'F4',d:0.42},{n:'A4',d:0.42},{n:'G4',d:0.85},
  {n:'E4',d:0.42},{n:'G4',d:0.42},{n:'C5',d:0.42},{n:'G4',d:0.42},
  {n:'A4',d:0.42},{n:'F4',d:0.42},{n:'E4',d:0.85},
  {n:'D4',d:0.42},{n:'F4',d:0.42},{n:'A4',d:0.42},{n:'G4',d:0.42},
  {n:'B4',d:0.42},{n:'C5',d:0.85},
  {n:'G4',d:0.42},{n:'E4',d:0.42},{n:'C4',d:0.85}
];
const bass = [
  {n:'C4',d:1.69},{n:'F4',d:1.69},{n:'D4',d:1.69},{n:'G4',d:0.85},{n:'C4',d:0.85}
];

function playTone(freq, startTime, duration, peakVol, type){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakVol, startTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

let melodyTimer = null;
function scheduleLoop(){
  const startAt = audioCtx.currentTime + 0.15;
  let t = startAt;
  melody.forEach(step=>{
    playTone(NOTE_FREQ[step.n], t, step.d * 0.92, 0.11, 'sine');
    t += step.d;
  });
  let bt = startAt;
  bass.forEach(step=>{
    playTone(NOTE_FREQ[step.n] / 2, bt, step.d * 0.95, 0.06, 'triangle');
    bt += step.d;
  });
  const loopLen = melody.reduce((a,s)=>a+s.d,0);
  melodyTimer = setTimeout(scheduleLoop, loopLen * 1000);
}

let musicPlaying = false;
const musicToggle = document.getElementById('musicToggle');
function startMusic(){
  if(audioCtx.state === 'suspended') audioCtx.resume();
  if(!melodyTimer) scheduleLoop();
  masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.2);
  musicPlaying = true;
  musicToggle.textContent = '🔊';
  musicToggle.classList.add('playing');
}
function stopMusic(){
  masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
  musicPlaying = false;
  musicToggle.textContent = '🔈';
  musicToggle.classList.remove('playing');
}
musicToggle.addEventListener('click', ()=>{
  musicPlaying ? stopMusic() : startMusic();
});

// ---------- envelope gate ----------
const gate = document.getElementById('gate');
const envelope = document.getElementById('envelope');
envelope.addEventListener('click', ()=>{
  envelope.classList.add('open');
  startMusic();
  setTimeout(()=>{ gate.classList.add('hidden'); }, 650);
});

// ---------- hero photo upload ----------
const heroPhoto = document.getElementById('heroPhoto');
const heroPhotoInput = document.getElementById('heroPhotoInput');
const heroPhotoIcon = document.getElementById('heroPhotoIcon');
heroPhoto.addEventListener('click', ()=> heroPhotoInput.click());
heroPhotoInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    heroPhoto.style.backgroundImage = `url(${ev.target.result})`;
    heroPhoto.classList.add('filled');
    heroPhotoIcon.style.display='none';
  };
  reader.readAsDataURL(file);
});

// ---------- kid photo upload ----------
const kidPhotoInput = document.getElementById('kidPhotoInput');
let activeKid = null;
document.querySelectorAll('.kid').forEach(k=>{
  k.addEventListener('click', ()=>{ activeKid = k; kidPhotoInput.click(); });
});
kidPhotoInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file || !activeKid) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    activeKid.style.backgroundImage = `url(${ev.target.result})`;
    activeKid.classList.add('filled');
  };
  reader.readAsDataURL(file);
});

// ---------- love counter ----------
const loveBtn = document.getElementById('loveBtn');
const loveCount = document.getElementById('loveCount');
let hearts = 0;
loveBtn.addEventListener('click', (e)=>{
  hearts++;
  loveCount.textContent = hearts + (hearts===1 ? ' heart sent so far' : ' hearts sent so far');
  const heart = document.createElement('span');
  heart.textContent = '💗';
  heart.style.position='fixed';
  heart.style.left = e.clientX+'px';
  heart.style.top = e.clientY+'px';
  heart.style.fontSize='1.4rem';
  heart.style.pointerEvents='none';
  heart.style.zIndex='90';
  heart.style.transition='transform 1s ease, opacity 1s ease';
  document.body.appendChild(heart);
  requestAnimationFrame(()=>{
    heart.style.transform = `translateY(-90px) translateX(${(Math.random()-0.5)*60}px)`;
    heart.style.opacity='0';
  });
  setTimeout(()=>heart.remove(),1000);
});

// ---------- certificate date + download ----------
document.getElementById('certDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
document.getElementById('downloadCert').addEventListener('click', ()=>{
  html2canvas(document.getElementById('certificate'),{backgroundColor:'#FFFDFA',scale:2}).then(canvas=>{
    const link = document.createElement('a');
    link.download = 'adeola-fajobi-certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

// ---------- floating hero icons ----------
const icons = ['🌸','💜','🧁','🩷','✨','🍰'];
const hero = document.getElementById('hero');
for(let i=0;i<16;i++){
  const el = document.createElement('span');
  el.className='float';
  el.textContent = icons[Math.floor(Math.random()*icons.length)];
  el.style.left = Math.random()*100+'%';
  el.style.animationDuration = (8+Math.random()*10)+'s';
  el.style.animationDelay = (Math.random()*10)+'s';
  el.style.fontSize = (1.2+Math.random()*1.6)+'rem';
  hero.appendChild(el);
}

// ---------- scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:.15});
revealEls.forEach(el=>io.observe(el));

// ---------- candles ----------
const candles = document.querySelectorAll('[data-candle]');
const finalMsg = document.getElementById('finalMsg');
candles.forEach(c=>{
  c.addEventListener('click', ()=>{
    if(c.classList.contains('out')) return;
    c.classList.add('out');
    if([...candles].every(x=>x.classList.contains('out'))){
      setTimeout(()=>{
        finalMsg.classList.add('show');
        burstConfetti();
        finalMsg.scrollIntoView({behavior:'smooth', block:'center'});
      },400);
    }
  });
});

// ---------- confetti ----------
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}
resize();
addEventListener('resize', resize);

let particles = [];
function burstConfetti(){
  const colors = ['#C7B3E0','#F7CBDB','#E4B15C','#8F72B8','#E890AF'];
  for(let i=0;i<140;i++){
    particles.push({
      x: canvas.width/2,
      y: canvas.height/2,
      vx: (Math.random()-0.5)*14,
      vy: (Math.random()-1.2)*14,
      size: 4+Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*360,
      vr: (Math.random()-0.5)*10,
      life: 100+Math.random()*40
    });
  }
  requestAnimationFrame(animateConfetti);
}
function animateConfetti(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.rot += p.vr; p.life--;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot*Math.PI/180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
    ctx.restore();
  });
  particles = particles.filter(p=>p.life>0 && p.y<canvas.height+50);
  if(particles.length>0) requestAnimationFrame(animateConfetti);
  else ctx.clearRect(0,0,canvas.width,canvas.height);
}
