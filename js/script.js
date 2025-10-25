const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const circle = document.getElementById('circle');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const playerNameInput = document.getElementById('playerName'); 
const toggleMusicBtn = document.getElementById('toggle-music'); 
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volume-icon');
const sfxtoggleMusicBtn = document.getElementById('sfxToggle');
const voicetoggleSoundBtn = document.getElementById('voiceToggle');
const congratsMessage = document.getElementById('congratsMessage');
const highScoreText = document.getElementById('highScoreText');

const clickSound = new Audio('assets/audio/click.mp3');
const backgroundMusic = new Audio('assets/audio/music.mp3');
const helloAudio = new Audio('assets/audio/hello.wav');
const niceAudio = new Audio('assets/audio/ntmy.wav');
const readytpAudio = new Audio('assets/audio/readytp.wav');
const tapmeAudio = new Audio('assets/audio/tapme.wav');
const greatAudio = new Audio('assets/audio/greatjob.wav');
const awnsomeAudio = new Audio('assets/audio/awnsome.wav');
const jayAudio = new Audio('assets/audio/yay.wav');
const sogoodAudio = new Audio('assets/audio/sogood.wav');
const perfectAudio = new Audio('assets/audio/perfect.wav');
const loveitAudio = new Audio('assets/audio/loveit.wav');
const winAudio = new Audio('assets/audio/win.wav');

let score = 0;
let timeLeft = 30;
let playing = false;
let musicPlaying = true; 
let countdown;
let circleSize = 100;
let highScore = parseInt(localStorage.getItem('highScore') || '0'); 
let idleTalkingInterval;
let idleTalkingIndex = 0;
let sfxEnabled = true;
let voiceEnabled = true;

restartBtn.style.display = 'none';

function startGame() {
  score = 0;
  timeLeft = 30;
  playing = true;
  circleSize = 100;
  stopIdleTalking();

  scoreText.textContent = 'Score: 0';
  timerText.textContent = 'Time: 30';
  scoreText.style.display = 'block';
  timerText.style.display = 'block';
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  highScoreText.style.display = 'block';
  sfxtoggleMusicBtn.parentElement.style.display = 'none';
  voicetoggleSoundBtn.parentElement.style.display = 'none';
  document.querySelector('.volume-control').style.display = 'none';

  moveCircle();

  countdown = setInterval(() => {
    timeLeft--;
    timerText.textContent = 'Time: ' + timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000); 

  circle.addEventListener('click', circleClickHandler);
}

function endGame() {
  clearInterval(countdown);
  playing = false;
  timerText.textContent = 'Time: 0 - Game Over!';
  restartBtn.style.display = 'inline-block';
  circle.style.display = 'none';
  circle.removeEventListener('click', circleClickHandler);
  document.querySelector('.volume-control').style.display = 'block';
  sfxtoggleMusicBtn.parentElement.style.display = 'block';
  voicetoggleSoundBtn.parentElement.style.display = 'block';
  saveScore(score);
}

function saveScore(score) {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreText.textContent = 'High Score: ' + highScore; 
    showCongratsThenFireworks(score);
  }
}

function showCongratsThenFireworks(score) {
  hideUI();
  congratsMessage.textContent = `🎉 New High Score: ${score} 🎉`;
  congratsMessage.style.display = 'block';

  playVoice(winAudio); 

  setTimeout(() => {
    startFireworksAnimation();

    function onScreenClick() {
      congratsMessage.style.display = 'none';
      showUI();
      stopFireworksAnimation();
      window.removeEventListener('click', onScreenClick);
    }

    window.addEventListener('click', onScreenClick);
  }, 100);
}

let fireworks = [];
let fireworksAnimating = false;
let fireworksCanvas, ctx;

function startFireworksAnimation() {
  fireworksCanvas = document.getElementById('fireworksCanvas');
  ctx = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  fireworksAnimating = true;
  fireworks = [];
  animateFireworks();
}

function stopFireworksAnimation() {
  fireworksAnimating = false;
  if (ctx) ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}

class Firework {
  constructor() {
    this.x = Math.random() * fireworksCanvas.width;
    this.y = fireworksCanvas.height;
    this.targetY = Math.random() * (fireworksCanvas.height / 2);
    this.speed = 4 + Math.random() * 2;
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.exploded = true;
        this.createParticles();
      }
    } else {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => p.alpha > 0);
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    } else {
      this.particles.forEach(p => p.draw());
    }
  }

  createParticles() {
    const colors = ['#ff4b4b', '#ffe24b', '#4bff4b', '#4bcfff', '#ff4bcf'];
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(this.x, this.y, colors[Math.floor(Math.random() * colors.length)]));
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speedX = (Math.random() - 0.5) * 6;
    this.speedY = (Math.random() - 0.5) * 6;
    this.alpha = 1;
    this.gravity = 0.05;
    this.size = 2 + Math.random() * 2;
  }

  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.02;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function animateFireworks() {
  if (!fireworksAnimating) return;

  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  if (fireworks.length < 5) {
    fireworks.push(new Firework());
  }

  fireworks.forEach(firework => {
    firework.update();
    firework.draw();
  });

  requestAnimationFrame(animateFireworks);
}

function moveCircle() {
  const margin = 50;
  const maxX = window.innerWidth - circleSize - margin;
  const maxY = window.innerHeight - circleSize - margin;
  const x = Math.random() * (maxX - margin) + margin;
  const y = Math.random() * (maxY - margin) + margin;

  circle.style.width = circleSize + 'px';
  circle.style.height = circleSize + 'px';
  circle.style.left = x + 'px';
  circle.style.top = y + 'px';
  circle.style.display = 'block';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

const phrases = [
  { text: 'Perfect! ✅', audio: perfectAudio },
  { text: 'So good! 😮', audio: sogoodAudio },
  { text: 'Love it 🥰', audio: loveitAudio },
  { text: 'Great job! 👍', audio: greatAudio },
  { text: 'Yay! 🎉', audio: jayAudio },
  { text: 'Awesome! 🌟', audio: awnsomeAudio },
];

function circleClickHandler() {
  if (!playing) return;

  playSfx(clickSound);

  score++;
  scoreText.textContent = 'Score: ' + score;

  if (circleSize > 35) {
    circleSize -= 5;
  }

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  speech.textContent = randomPhrase.text;
  speech.style.opacity = 1;

  playVoice(randomPhrase.audio);

  setTimeout(() => {
    speech.style.opacity = 0;
  }, 800);

  moveCircle();
}


const speech = document.querySelector('.speech');
const openingSpeech = ['Hello!👋', 'Nice to meet you!😃', 'Ready to play?', 'Tap me if you can! 😉', '🥰'];

function startIdleTalking() {
  idleTalkingInterval = setInterval(() => {
    speech.textContent = openingSpeech[idleTalkingIndex];
    speech.style.opacity = 1;

    if (idleTalkingIndex === 0) {
      helloAudio.play();
    } else if (idleTalkingIndex === 1) {
      niceAudio.play();
    } else if (idleTalkingIndex === 2) {
      readytpAudio.play()
    } else if (idleTalkingIndex === 3) {
      tapmeAudio.play()
    }

    setTimeout(() => {
      speech.style.opacity = 0;
    }, 1000);

    idleTalkingIndex++;
    if (idleTalkingIndex >= openingSpeech.length) {
      idleTalkingIndex = 4;
    }
  }, 2200);
}

function stopIdleTalking() {
  clearInterval(idleTalkingInterval);
  speech.style.opacity = 0;
}

backgroundMusic.loop = true;
backgroundMusic.volume = 1.0;

window.addEventListener('click', () => {
  backgroundMusic.play();
}, { once: true });

volumeSlider.addEventListener('input', () => {
  const volume = parseFloat(volumeSlider.value);
  backgroundMusic.volume = volume;

  volumeIcon.textContent =
    volume === 0 ? '🔇' : volume <= 0.5 ? '🔉' : '🔊'; 
});

document.addEventListener('DOMContentLoaded', () => {
  highScoreText.textContent = 'High Score: ' + highScore; 
});

function playSfx(audio) {
  if (sfxEnabled) {
    audio.currentTime = 0;
    audio.play();
  }
}

function playVoice(audio) {
  if (voiceEnabled) {
    audio.currentTime = 0;
    audio.play();
  }
}

sfxtoggleMusicBtn.addEventListener('click', () => {
  sfxEnabled = !sfxEnabled;
  sfxtoggleMusicBtn.textContent = sfxEnabled ? '🔈' : '🔇';
});

voicetoggleSoundBtn.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voicetoggleSoundBtn.textContent = voiceEnabled ? '🗣️' : '🔇';
});

startIdleTalking();

const uiElements = [
  highScoreText,
  restartBtn,
  document.querySelector('.volume-control'),
  timerText,
  scoreText,
  circle,
];

function hideUI() {
  uiElements.forEach((el) => {
    if (el) el.style.display = 'none';
  });
}

function showUI() {
  uiElements.forEach((el) => {
    if (el) el.style.display = '';
  });
}
